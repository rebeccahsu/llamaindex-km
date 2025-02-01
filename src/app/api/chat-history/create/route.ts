import { ChatHistoryModel } from "db/models";
import { NextRequest, NextResponse } from "next/server";
import ChatHistory from "src/models/ChatHistory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// create new chat history
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      params,
    }: {
      name: string;
      params?: any;
    } = await request.json();

    console.log('[API] to create new chat history', name);

    const newChatHistory = await ChatHistoryModel.create({
      name: name,
      messages: [],
    });

    console.log('created', newChatHistory);

    const newChat: ChatHistory = {
      id: `${newChatHistory._id}`,
      name: newChatHistory.name,
      messages: []
    }

  return NextResponse.json({ data: newChat }, { status: 201 });
  } catch (error) {
    console.error("[API] create chat history", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
