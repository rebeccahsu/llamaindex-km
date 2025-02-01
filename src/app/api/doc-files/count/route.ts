import { NextRequest, NextResponse } from "next/server";
import { DocumentFileModel } from "db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const count = await DocumentFileModel.countDocuments();

    // return NextResponse.json({}, {status: 404, statusText: "invalid URL"});

    return NextResponse.json({
      count
    })

  } catch (error) {
    console.error("[API] /doc-files/count", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
