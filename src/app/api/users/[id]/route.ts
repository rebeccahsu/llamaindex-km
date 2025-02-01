import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TODO:

export async function GET(request: NextRequest) {
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

    
    return NextResponse.json(
      {
        message: 'import success',
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("[API] get profile", error, (error as Error).message);

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
