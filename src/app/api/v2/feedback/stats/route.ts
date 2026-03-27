import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/v2/feedback/stats`, {
      next: { revalidate: 60 },
    });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({
      total_count: 0,
      average_rating: 0,
      rating_distribution: {},
      recent_comments: [],
    });
  }
}
