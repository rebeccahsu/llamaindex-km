'use server'
import { ObjectId } from 'mongodb';

import { ChatHistoryModel } from 'db/models';
import { IChatMessageData } from 'db/models/ChatHistory';
import ChatHistory from 'src/models/ChatHistory';
 
export async function getChatHistoryByIdFromMongo(id: string): Promise<ChatHistory | null> {
  console.log('getChatHistoryByIdFromMongo:', id);
  try {
    const data = await ChatHistoryModel.findOne({ _id: new ObjectId(id) });
    console.log('getChatHistoryByIdFromMongo data:', data);

    if (!data) {
      return null
    }

    return {
      id: `${data._id}`,
      name: data.name,
      messages: data.messages.map((message: IChatMessageData) => ({
        role: message.role,
        _id: `${message._id}`,
        content: message.content,
        createdAt: message.createdAt,
        messageId: message.messageId,
        ...(message.annotationsJson ? { annotations: JSON.parse(message.annotationsJson) } : {})
      })),
    };

  } catch (error) {
    console.error('ChatHistoryModel error:', error);
    throw error
  }
}

 
export async function deleteChatHistoryById(id: string): Promise<any | null> {
  console.log('deleteChatHistoryById:', id);
  try {
    const result = await ChatHistoryModel.deleteOne({ _id: new ObjectId(id) });
    console.log('delete result:', result);

    if (result.deletedCount === 0) {
      return { message: 'Document not found', status: 404 };
    }

    return { message: 'Document deleted successfully', status: 200 };

  } catch (error) {
    console.error('deleteChatHistoryById error:', error);
    throw error
  }
}