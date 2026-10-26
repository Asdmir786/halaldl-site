import { NextResponse } from "next/server";
import { jsonError } from "@/lib/fetch/http";
import { publicStatus } from "@/lib/fetch/service";

export async function GET() {
  try {
    return NextResponse.json(await publicStatus());
  } catch (error) {
    return jsonError(error);
  }
}
