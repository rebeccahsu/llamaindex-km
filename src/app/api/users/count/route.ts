import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const count = await UserModel.countDocuments();

    return NextResponse.json({
      count
    })

  } catch (error) {
    console.error("[API] /users/count", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
