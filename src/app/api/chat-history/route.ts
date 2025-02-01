import { ChatHistoryDocument, ChatHistoryModel } from "db/models";
import { NextRequest, NextResponse } from "next/server";
import ChatHistory from 'src/models/ChatHistory';
import { PipelineStage } from 'mongoose';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// get chat history list (id & name)
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    console.log('[API] fetch chat history list');

    const stages = [
      // pagingQuery ? { $match: pagingQuery } : null,
      { $project: { _id: 1, name: 1 } },
      { $sort: { _id: 1 } },
      // { $limit: limit + 1 },
    ].filter((s) => !!s) as PipelineStage[]

    const docs = await ChatHistoryModel.aggregate(stages)

    const transformedData = docs.map((doc: ChatHistoryDocument): ChatHistory => ({
      id: `${doc._id}`,
      name: doc.name
    }));

  return NextResponse.json({ list: transformedData }, { status: 200 });
  } catch (error) {
    console.error("[API] fetch chat history", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
