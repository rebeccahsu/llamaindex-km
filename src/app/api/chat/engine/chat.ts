import { ContextChatEngine, Settings } from "llamaindex";
import { getDataSource } from "./index";
import { nodeCitationProcessor } from "./nodePostprocessors";
import { generateFilters } from "./queryFilter";
import { SYSTEM_PROMPT as SystemPrompt, SYSTEM_CITATION_PROMPT as SystemCitationPrompt } from "src/constants";

export async function createChatEngine(documentIds?: string[], params?: any) {
  console.log('----createChatEngine documentIds---', documentIds);
  const index = await getDataSource(params);
  if (!index) {
    throw new Error(
      `StorageContext is empty - call 'npm run generate' to generate the storage first`,
    );
  }
  const retriever = index.asRetriever({
    similarityTopK: process.env.TOP_K ? parseInt(process.env.TOP_K) : undefined,
    filters: generateFilters(documentIds || []),
  });

  const systemPrompt = SystemPrompt;
  const citationPrompt = SystemCitationPrompt;
  const prompt =
    [systemPrompt, citationPrompt].filter((p) => p).join("\n") || undefined;
  const nodePostprocessors = citationPrompt
    ? [nodeCitationProcessor]
    : undefined;

  return new ContextChatEngine({
    chatModel: Settings.llm,
    retriever,
    systemPrompt: prompt,
    nodePostprocessors,
  });
}
