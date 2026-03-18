import { NextResponse } from "next/server";
import { SITE_LINKS } from "@/lib/site";

export function GET() {
  return NextResponse.redirect(SITE_LINKS.latestReleaseUrl, 307);
}
