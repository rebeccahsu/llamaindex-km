import { ObjectId } from 'mongodb';

import { ChatHistoryModel } from "db/models";
import { NextRequest, NextResponse } from "next/server";
import { Message } from 'ai';
import { IChatMessageData } from 'db/models/ChatHistory';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// get chat history by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }

  try {
    console.log('[API] to fetch chat history by id', id);

    const chatHistory = await ChatHistoryModel.findOne({ _id: new ObjectId(id) });

    console.log('findOne', chatHistory);

  return NextResponse.json({ data: chatHistory }, { status: 200 });
  } catch (error) {
    console.error("[API] create chat history", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

// update chat history
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }

  try {
    const {
      messages,
      params,
    }: {
      messages: any[];
      params?: any;
    } = await request.json();

    console.log('[API] to update chat history', id, messages);

    const chatHistory = await _upsertMessage(id, messages);

    console.log('updated', chatHistory);

  return NextResponse.json({ data: chatHistory }, { status: 200 });
  } catch (error) {
    console.error("[API] create chat history", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

async function _upsertMessage(chatHistoryId: string, messages: Message[]) {
  try {
    const chatHistory = await ChatHistoryModel.findOne({ _id: new ObjectId(chatHistoryId) });
    if (!chatHistory) {
      throw new Error('Chat history not found');
    }

    const existingMessages = chatHistory.messages;

    // console.log('existingMessages', existingMessages);

    // Update existing message
    messages.forEach((message) => {
      const existingMessageIndex = existingMessages.findIndex(
        (msg: IChatMessageData) => msg.messageId === message.id
      );

      if (existingMessageIndex !== -1) {
        existingMessages[existingMessageIndex].content = message.content;
        if (message.annotations?.length) {
          existingMessages[existingMessageIndex].annotationsJson = JSON.stringify(message.annotations);
        }
      } else {
        existingMessages.push({
          ...message,
          messageId: message.id,
          annotationsJson: message.annotations?.length ? JSON.stringify(message.annotations) : null,
        });
      }
    });

    await chatHistory.save();
    console.log('Chat history updated successfully');
  } catch (err) {
    console.error('Error updating chat history:', err);
  }
}
