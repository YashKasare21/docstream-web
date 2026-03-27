import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backendUrl}/api/v2/providers`, {
      next: { revalidate: 30 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { providers: [], active: null, error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
