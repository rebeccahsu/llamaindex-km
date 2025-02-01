import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// get chat history list
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error("[API] health check", error, (error as Error).message);

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
