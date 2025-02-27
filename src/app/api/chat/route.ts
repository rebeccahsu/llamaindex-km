import { initObservability } from "src/app/observability";
import { LlamaIndexAdapter, Message, StreamData } from "ai";
import { ChatMessage, Settings } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { createChatEngine } from "./engine/chat";
import { initSettings } from "./engine/settings";
import {
  isValidMessages,
  retrieveDocumentIds,
  retrieveMessageContent,
} from "./llamaindex/streaming/annotations";
import { createCallbackManager } from "./llamaindex/streaming/events";
import { generateNextQuestions } from "./llamaindex/streaming/suggestion";
import { getAccessibleDocIds } from "@/app/actions/documentFile";

initObservability();
initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Init Vercel AI StreamData and timeout
  const vercelStreamData = new StreamData();

  try {
    const body = await request.json();
    const { messages, data }: { messages: Message[]; data?: any } = body;
    if (!isValidMessages(messages)) {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }

    console.log('POST api/chat data', data);

    // retrieve document ids from the annotations of all messages (if any)
    const ids = retrieveDocumentIds(messages);
    console.log('messages', messages);
    console.log('retrieveDocumentIds', ids);

    console.log('---------------------------------');

    const accessibleDocIds = await getAccessibleDocIds([data.department]);
    console.log('-------------------getAccessibleDocIds', accessibleDocIds);

    data.docIds = accessibleDocIds;

    const combinedDocIds = ids.concat(accessibleDocIds);

    // create chat engine with index using the document ids
    const chatEngine = await createChatEngine(combinedDocIds, data);

    // retrieve user message content from Vercel/AI format
    const userMessageContent = retrieveMessageContent(messages);
    console.log('userMessageContent', userMessageContent);

    // Setup callbacks
    const callbackManager = createCallbackManager(vercelStreamData);
    const chatHistory: ChatMessage[] = messages as ChatMessage[];

    // Calling LlamaIndex's ChatEngine to get a streamed response
    const response = await Settings.withCallbackManager(callbackManager, () => {
      return chatEngine.chat({
        message: userMessageContent,
        chatHistory,
        stream: true,
      });
    });

    const onFinal = (content: string) => {
      chatHistory.push({ role: "assistant", content: content });
      generateNextQuestions(chatHistory)
        .then((questions: string[]) => {
          if (questions.length > 0) {
            vercelStreamData.appendMessageAnnotation({
              type: "suggested_questions",
              data: questions,
            });
          }
        })
        .finally(() => {
          vercelStreamData.close();
        });
    };

    return LlamaIndexAdapter.toDataStreamResponse(response, {
      data: vercelStreamData,
      callbacks: { onFinal },
    });
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        detail: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}
