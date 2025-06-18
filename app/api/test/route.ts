import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API Next.js fonctionne !",
    timestamp: new Date().toISOString(),
    status: "ok",
  });
}
