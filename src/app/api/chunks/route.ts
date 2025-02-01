import { NextRequest, NextResponse } from "next/server";
import { getMilvusClient } from "../chat/engine/shared";
import File from "src/models/File";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// fetch all chunks in a collection
export async function POST(request: NextRequest) {
  try {
    const {
      collectionName,
      params,
    }: {
      collectionName: string;
      params?: any;
    } = await request.json();

    console.log('prepare to fetch chunks', collectionName);

    const milvusClient = getMilvusClient();
    const { data } = await milvusClient.query({
      collection_name: collectionName,
      // expr: "age > 0",
      output_fields: ["id", "content", "metadata"],
      limit: 1000
    });

    console.log('--chunks--', data);
 
  return NextResponse.json({ data });
  } catch (error) {
    console.error("[fetch data API]", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
