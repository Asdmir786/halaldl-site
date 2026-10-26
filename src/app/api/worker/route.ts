import { NextResponse } from "next/server";
import { jsonError, readJsonObject } from "@/lib/fetch/http";
import { claimJob, completeJob, recordHeartbeat, cleanupExpired, authenticateWorker } from "@/lib/fetch/service";

export async function POST(request: Request) {
  try {
    authenticateWorker(request);
    const body = await readJsonObject(request, 512_000);
    await recordHeartbeat(request, {
      runningJobs: Number(body.runningJobs ?? 0),
      waitingJobs: Number(body.waitingJobs ?? 0),
      loadAverage: typeof body.loadAverage === "number" ? body.loadAverage : null,
      memoryFreeMb: typeof body.memoryFreeMb === "number" ? body.memoryFreeMb : null,
      diskFreeMb: typeof body.diskFreeMb === "number" ? body.diskFreeMb : null,
      cpuCount: typeof body.cpuCount === "number" ? body.cpuCount : null,
      accepting: Boolean(body.accepting),
      transcoding: Boolean(body.transcoding),
      protocolVersion: Number(body.protocolVersion ?? 1),
      detail: typeof body.detail === "string" ? body.detail.slice(0, 200) : null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    return NextResponse.json({ job: await claimJob(request) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    authenticateWorker(request);
    const body = await readJsonObject(request, 512_000);
    await completeJob(request, String(body.id ?? ""), body as Parameters<typeof completeJob>[2]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try { return NextResponse.json(await cleanupExpired(request)); }
  catch (error) { return jsonError(error); }
}
