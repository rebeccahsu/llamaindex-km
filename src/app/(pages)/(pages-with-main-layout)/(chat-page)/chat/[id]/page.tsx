import { getChatHistoryByIdFromMongo } from "@/app/actions/chatHistory";
import ChatSection from "../../../../../components/chat-section";
import ChatHistory from "src/models/ChatHistory";

interface ChatProps {
  params: {
    id: string;
  };
}

async function getChatHistory(id: string): Promise<ChatHistory | null> {
  try {
    const res = await getChatHistoryByIdFromMongo(id);
    return res;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return null;
  }
}

export default async function Chat({ params }: ChatProps) {
  console.log('Chat', params);
  const chatHistory = await getChatHistory(params.id);

  const messages = !!chatHistory && !!chatHistory.messages
    ? chatHistory.messages.map((m) => ({
      ...m,
      _id: m._id,
      id: m.messageId
    }))
    : [];

  return (
    <>
      <ChatSection
        chatHistoryId={!!chatHistory ? params.id : ''}
        messagesFromDB={messages}
      />
    </>
  );
}
