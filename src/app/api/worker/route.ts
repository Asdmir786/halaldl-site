import { NextResponse } from "next/server";
import { jsonError, readJsonObject } from "@/lib/fetch/http";
import { claimJob, completeJob, recordHeartbeat, cleanupExpired, authenticateWorker, workerJobActive } from "@/lib/fetch/service";
import { configuredConcurrency } from "@/lib/fetch/health";

export async function GET(request: Request) {
  try {
    authenticateWorker(request);
    const jobId = new URL(request.url).searchParams.get("jobId");
    if (jobId) return NextResponse.json({ active: await workerJobActive(request, jobId) });
    return NextResponse.json({ protocolVersions: [2, 3], maxConcurrency: configuredConcurrency() });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    authenticateWorker(request);
    const body = await readJsonObject(request, 512_000);
    const kinds = body.claimKinds ?? ["download", "probe"];
    if (body.claim === true && (!Array.isArray(kinds) || kinds.length < 1 || kinds.length > 2 || kinds.some(kind => !["probe", "download"].includes(kind)) || new Set(kinds).size !== kinds.length)) {
      return NextResponse.json({ error: "kind", message: "Invalid claim kinds." }, { status: 400 });
    }
    const result = await recordHeartbeat(request, {
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
      workerId: typeof body.workerId === "string" ? body.workerId : undefined,
      capacity: typeof body.capacity === "number" ? body.capacity : undefined,
      activeJobs: Array.isArray(body.activeJobs) ? body.activeJobs as { id: string; leaseToken: string }[] : undefined,
      downloadAccepting: body.downloadAccepting === true,
    });
    return NextResponse.json(body.claim === true ? { ...result, job: await claimJob(request, kinds as string[]) } : result);
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
