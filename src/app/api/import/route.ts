import { NextRequest, NextResponse } from "next/server";
import { loadAndIndex } from "../chat/engine/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const {
      collectionName,
      urls,
      permission,
      customFileName,
      params,
    }: {
      collectionName: string;
      urls: string[];
      permission?: string;
      customFileName?: string;
      params?: any;
    } = await request.json();

    if (!urls) {
      return NextResponse.json(
        { error: "urls is required in the request body" },
        { status: 400 },
      );
    }

    await loadAndIndex({
      collectionName,
      urls,
      permission,
      customFileName
    });
    return NextResponse.json(
      {
        message: 'import success',
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Import API]", error, (error as Error).message);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }
}
