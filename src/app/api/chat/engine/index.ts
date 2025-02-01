import { VectorStoreIndex } from "llamaindex";
import { MilvusVectorStore } from "llamaindex/vector-store/MilvusVectorStore";
import { checkRequiredEnvVars, getMilvusClient } from "./shared";

export async function getDataSource(params?: any) {
  console.log('getDataSource params', params);
  console.log('get sources from collection: ', params.collectionName);
  checkRequiredEnvVars();
  const milvusClient = getMilvusClient();
  const store = new MilvusVectorStore({
    milvusClient,
    collection: params.collectionName
  });

  return await VectorStoreIndex.fromVectorStore(store);
}
