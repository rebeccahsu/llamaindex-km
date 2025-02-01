'use server'

import { getMilvusClient } from '../api/chat/engine/shared'
 
export async function fetchCollections() {
  try {
    const milvusClient = getMilvusClient();
    const { data } = await milvusClient.listCollections();
    return data
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    throw error
  }
}

export async function fetchData(collectionName: string) {
  try {
    const milvusClient = getMilvusClient();
    const { data } = await milvusClient.query({
      collection_name: collectionName,
      output_fields: ["id", "content", "metadata"],
      limit: 1000
    });
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error
  }
}
