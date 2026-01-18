import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "the-furniture-store-app",
      version: "376b5fe", // Latest commit hash
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
