"""Local-only browser acceptance checks with explicit API fixtures.

Run: python tests/fetch-ui.py (requires Playwright and the isolated preview).
Fixtures exercise UI state and recovery; database/worker tests verify the API.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

origin = os.environ.get("FETCH_TEST_ORIGIN", "http://127.0.0.1:4188")
parsed = urlparse(origin)
if parsed.hostname not in ("127.0.0.1", "localhost") or parsed.scheme != "http":
    raise RuntimeError("UI tests require an isolated local preview")
output = Path(".analytics/fetch-go/screenshots")
output.mkdir(parents=True, exist_ok=True)
job_id = "11111111-1111-4111-8111-111111111111"
formats = [
    {"formatId": "v0", "label": "720p", "ext": "mp4", "height": 720, "filesize": 6000000, "mediaType": "video", "hasAudio": True, "deliveryMode": "video_audio"},
    {"formatId": "a0", "label": "Original audio", "ext": "m4a", "filesize": 800000, "mediaType": "audio", "hasAudio": True, "deliveryMode": "audio"},
    {"formatId": "s0", "label": "720p", "ext": "mp4", "height": 720, "filesize": 5200000, "mediaType": "video", "hasAudio": False, "deliveryMode": "video_only"},
]


def fixture(status):
    return {"id": job_id, "status": status, "platform": "vimeo", "errorCode": "blocked" if status == "failed" else None,
            "formats": formats if status == "waiting_choice" else [], "ready": status == "ready", "title": "A public video with a longer title that still fits on mobile",
            "thumbnail": None, "duration": 8, "deliveryMode": "video_audio", "bytes": 6000000, "queuePosition": 1 if status == "queued" else None,
            "expiresAt": "2099-01-01T23:00:00Z", "extension": "mp4", "sourceUrl": "https://vimeo.com/1084537"}


results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height in [(360, 800), (390, 844), (768, 1024), (1366, 768)]:
        for theme in ["light", "dark"]:
            for state in ["idle", "offline", "queued", "probing", "waiting_choice", "ready", "failed", "paused", "preparation_paused"]:
                context = browser.new_context(viewport={"width": width, "height": height}, color_scheme=theme, reduced_motion="reduce")
                context.route("**/api/fetch/clearance", lambda route: route.fulfill(json={"ok": True}))
                context.route("**/api/fetch/history", lambda route: route.fulfill(json={"jobs": []}))
                page = context.new_page()

                errors = []
                page.on("pageerror", lambda e: errors.append(str(e)))
                data = {"available": state not in ("offline", "paused"), "workerConnected": state not in ("offline", "paused"), "canDownload": state not in ("offline", "paused", "preparation_paused"), "cleared": True, "jobId": None if state in ("idle", "offline") else job_id,
                        "reason": "offline" if state in ("offline", "paused") else "ok", "message": "The download service is offline. Please try again shortly.", "supportedPlatforms": ["vimeo"]}
                page.route("**/api/fetch/status", lambda route: route.fulfill(json=data))
                page.route("**/api/fetch/jobs/*", lambda route: route.fulfill(json=fixture("downloading" if state == "paused" else "waiting_choice" if state == "preparation_paused" else state)))
                page.goto(origin + "/fetch", wait_until="domcontentloaded", timeout=120000)
                expect(page.get_by_label("Public video link", exact=True)).to_be_visible(timeout=60000)
                expect(page.get_by_role("list", name="Progress")).to_have_count(0)
                if state in ("idle", "offline"):
                    page.get_by_label("Public video link", exact=True).fill("https://vimeo.com/1084537")
                    page.get_by_role("checkbox").check()
                    if state == "offline":
                        expect(page.get_by_role("button", name="Check link", exact=True)).to_be_disabled()
                        expect(page.get_by_text(data["message"], exact=False)).to_be_visible()
                    else:
                        expect(page.get_by_role("button", name="Check link", exact=True)).to_be_enabled()
                else:
                    label = {"queued": "Queued · #1", "probing": "Working", "waiting_choice": "Choose a file", "ready": "Done", "failed": "Couldn’t finish", "paused": "Paused", "preparation_paused":"Choose a file"}[state]
                    expect(page.get_by_text(label, exact=True)).to_be_visible(timeout=30000)
                if state=="preparation_paused":
                    expect(page.get_by_role("button",name="Prepare download",exact=True)).to_be_disabled()
                    expect(page.get_by_text("File preparation is temporarily paused. Your link and choices are saved.",exact=True)).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), (width, theme, state, "horizontal overflow")
                assert not errors, errors
                if width in (390, 1366):
                    page.screenshot(path=str(output / f"{state}-{theme}-{width}.png"), full_page=True, animations="disabled")
                if width==1366 and theme=="light" and state=="waiting_choice":
                    page.locator(".fetch-panel").first.screenshot(path=str(output/"result-card-light.png"))
                if state=="waiting_choice":
                    page.get_by_role("radio",name="Audio only",exact=True).check()
                    expect(page.get_by_role("combobox",name="Audio",exact=True)).to_have_value("a0")
                results.append({"width": width, "theme": theme, "state": state, "passed": True})
                context.close()
            print(json.dumps({"viewport": width, "theme": theme, "states_passed": 9}), flush=True)

    # A backend outage between the health check and submission must preserve input.
    context = browser.new_context(viewport={"width": 390, "height": 844})
    context.route("**/api/fetch/clearance", lambda route: route.fulfill(json={"ok": True}))
    context.route("**/api/fetch/history", lambda route: route.fulfill(json={"jobs": []}))
    page = context.new_page()

    page.route("**/api/fetch/status", lambda route: route.fulfill(json={"available": True, "cleared": True, "jobId": None}))
    page.route("**/api/fetch/probe", lambda route: route.fulfill(status=503, json={"error": "worker_offline", "message": "The download service is offline. Please try again shortly."}))
    page.goto(origin + "/fetch", wait_until="domcontentloaded")
    link = page.get_by_label("Public video link", exact=True)
    link.fill("https://vimeo.com/1084537")
    page.get_by_role("checkbox").check()
    page.get_by_role("button", name="Check link", exact=True).click()
    expect(page.get_by_role("alert").filter(has_text="offline")).to_contain_text("offline")
    expect(link).to_have_value("https://vimeo.com/1084537")
    expect(page.get_by_role("checkbox")).to_be_checked()
    context.close()

    # The worker dropping offline must replace Working with Paused automatically.
    context = browser.new_context(viewport={"width": 390, "height": 844})
    context.route("**/api/fetch/clearance", lambda route: route.fulfill(json={"ok": True}))
    context.route("**/api/fetch/history", lambda route: route.fulfill(json={"jobs": []}))
    page = context.new_page()

    health = {"workerConnected": True, "canDownload":True, "available": True, "cleared": True, "jobId": job_id}
    page.route("**/api/fetch/status", lambda route: route.fulfill(json=health))
    page.route("**/api/fetch/jobs/*", lambda route: route.fulfill(json=fixture("downloading")))
    page.goto(origin + "/fetch", wait_until="domcontentloaded")
    expect(page.get_by_text("Working", exact=True)).to_be_visible()
    health["available"] = False
    health["workerConnected"] = False
    expect(page.get_by_text("Paused", exact=True)).to_be_visible(timeout=15000)
    health["available"] = True
    health["workerConnected"] = True
    expect(page.get_by_text("Working", exact=True)).to_be_visible(timeout=15000)
    context.close()
    # A saved job discovered after a lost submission response must be restored.
    context = browser.new_context(viewport={"width": 390, "height": 844})
    context.route("**/api/fetch/clearance", lambda route: route.fulfill(json={"ok": True}))
    context.route("**/api/fetch/history", lambda route: route.fulfill(json={"jobs": []}))
    page = context.new_page()

    health = {"available": True, "workerConnected": True, "canDownload": True, "cleared": True, "jobId": None}
    page.route("**/api/fetch/status", lambda route: route.fulfill(json=health))
    page.route("**/api/fetch/jobs/*", lambda route: route.fulfill(json=fixture("queued")))
    def accepted_but_lost(route):
        health["jobId"] = job_id
        route.fulfill(status=502, json={"message": "The response was interrupted."})
    page.route("**/api/fetch/probe", accepted_but_lost)
    page.goto(origin + "/fetch", wait_until="domcontentloaded")
    page.get_by_label("Public video link", exact=True).fill("https://vimeo.com/1084537")
    page.get_by_role("checkbox").check()
    page.get_by_role("button", name="Check link", exact=True).click()
    expect(page.get_by_text("Queued · #1", exact=True)).to_be_visible(timeout=15000)
    context.close()
    browser.close()

Path(".analytics/fetch-go/ui-results.json").write_text(json.dumps({"states": results, "submission_outage_preserves_input": True, "worker_outage_and_recovery": True, "lost_submission_restored":True}, indent=2))
print(json.dumps({"ui_states_passed": len(results), "outage_recovery_checks_passed": 3}), flush=True)
