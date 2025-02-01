"use client";

import { Message, useChat } from "ai/react";
import { useEffect, useState } from "react";

import { ChatInput, ChatMessages } from "./ui/chat";
import { useClientConfig } from "./ui/chat/hooks/use-config";
import { useAppStore, useUserStore } from "src/stores";
import { useMessagesStore } from "src/stores";
import { DepartmentLabel } from "src/constants";
import { useRouter } from "next/navigation";
import { IChatMessageData } from "db/models/ChatHistory";

export default function ChatSection({ chatHistoryId, messagesFromDB }: { chatHistoryId?: string, messagesFromDB?: IChatMessageData[] }) {
  const { backend } = useClientConfig();
  const [requestData, setRequestData] = useState<any>();
  const { collectionName, department } = useAppStore();
  const router = useRouter();
  const {
    messages: storedMessages,
    setMessages: setStoredMessages,
    setMessageById: setStoredMessageById,

    messagesMap,
    setMessagesMap,
    setMessageInMap
  } = useMessagesStore();
  
  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    append,
    setInput,
  } = useChat({
    body: {
      data: {
        ...requestData,
        collectionName,
        department
      }
    },
    api: `${backend}/api/chat`,
    headers: {
      "Content-Type": "application/json", // using JSON because of vercel/ai 2.2.26
    },
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      const message = JSON.parse(error.message);
      alert(message.detail);
    },
    sendExtraMessageFields: true,
    initialMessages: messagesFromDB,
    onFinish: (message: Message) => {
      setStoredMessageById(message.id, message);
      if (chatHistoryId) {
        setMessageInMap(chatHistoryId, message);
        const newMessages = messagesMap[chatHistoryId];
        const index = newMessages.findIndex((m) => m.id === message.id);
        if (index > -1) {
          newMessages[index].content = message.content;
        } else {
          newMessages.push(message);
        }
        insertChatHistoryToDB(chatHistoryId, newMessages);
      }
    }

  });


  const insertChatHistoryToDB = async (chatHistoryId: string, messages: Message[]) => {
    // console.log('.......[insertChatHistoryToDB] to insertChatHistoryToDB', chatHistoryId, messages);
    try {
      const res = await fetch(`${backend}/api/chat-history/${chatHistoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
        }),
      });
      const { data } = await res.json();
      // console.log('[insertChatHistoryToDB] inserted chat history', data);
    } catch (error) {
      console.error('updateChatHistory', error);
    }
  }


  useEffect(() => {
    if (chatHistoryId) {
      // console.log('---messagesFromDB---', messagesFromDB);
      if (messagesFromDB && (!messagesMap[chatHistoryId] || messagesMap[chatHistoryId].length < 1)) {
        setMessagesMap({ ...messagesMap, [chatHistoryId]: messagesFromDB });
      }
    } else {
      router.replace('/chat');
    }
  }, [messagesFromDB]);

  useEffect(() => {
    // console.log(messages.length, storedMessages.length);
    if (messages.length !== storedMessages.length) {
      setStoredMessages(messages);
      
      if (chatHistoryId) {
        setMessagesMap({ ...messagesMap, [chatHistoryId]: messages });
        if (messagesFromDB && messagesFromDB.length !== messages.length) {
          // console.log('[INSERT HERE]', messagesFromDB, messages);
          insertChatHistoryToDB(chatHistoryId, messages);
        }
      }
    }
  }, [messages, storedMessages]);


  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      <div className="ml-5">Department: {DepartmentLabel[department] || department}</div>
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        reload={reload}
        stop={stop}
        append={append}
      />
      <ChatInput
        input={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        messages={messages}
        append={append}
        setInput={setInput}
        requestParams={{ params: requestData }}
        setRequestData={setRequestData}
      />
    </div>
  );
}
