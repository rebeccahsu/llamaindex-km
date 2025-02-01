import { NextRequest, NextResponse } from "next/server";
import { getMilvusClient } from "../../chat/engine/shared";
import File from "src/models/File";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// remove chunks
export async function POST(request: NextRequest) {
  try {
    const {
      docIds,
      collectionName
    }: {
      docIds: string[];
      collectionName: string;
    } = await request.json();

    console.log('prepare to remove chunks', docIds);

    const milvusClient = getMilvusClient();
    const { data } = await milvusClient.query({
      collection_name: collectionName,
      expr: `metadata["doc_id"] in [${docIds.map(id => `"${id}"`).join(',')}]`,
      limit: 1000
    });

    console.log('--chunks--', data);

    const ids = data.map((doc: any) => doc.id);

    const res = await milvusClient.delete({
      collection_name: collectionName,
      ids
    });

    console.log('deleted res', res)
 
  return NextResponse.json(res);
  } catch (error) {
    console.error("[fetch data API]", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
