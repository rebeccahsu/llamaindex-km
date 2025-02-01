import * as dotenv from "dotenv";
import { Document, VectorStoreIndex, storageContextFromDefaults } from "llamaindex";
import { MilvusVectorStore } from "llamaindex/vector-store/MilvusVectorStore";
import { getDocuments } from "./loader";
import { initSettings } from "./settings";
import { checkRequiredEnvVars, getMilvusClient } from "./shared";
import { DocumentFileData, DocumentFileModel } from "db/models";
import { EDocFileStatus } from "db/models/DocumentFile/constants";

dotenv.config();

interface LoadAndIndexParams {
  collectionName: string;
  urls?: string[];
  metadata?: Record<string, any>;
  permission?: string;
  customFileName?: string;
}

export async function loadAndIndex({
  collectionName,
  urls = [],
  permission,
  customFileName
}: LoadAndIndexParams) {
  if (!collectionName) {
    throw new Error("Collection name is required");
  }

  try {
    const documents = await getDocuments(urls);
    console.log('+++++documents+++++', documents);

    const filesMap: { [key: string]: DocumentFileData } = {};

    documents.forEach((doc: Document) => {
      if (!filesMap[doc.metadata.file_path]) {
        filesMap[doc.metadata.file_path] = {
          name: customFileName || doc.metadata.file_name,
          path: doc.metadata.file_path,
          docIds: [doc.id_],
          status: EDocFileStatus.Pending,
        };
      } else {
        filesMap[doc.metadata.file_path].docIds.push(doc.id_);
      }
    });

    // insert documents into mongoDB
    const documentFiles = await DocumentFileModel.insertMany(
      Object.values(filesMap).map((d) => ({
        ...d,
        collectionName: collectionName,
        permission
      }))
    )

    console.log('...documentFiles...', documentFiles);

    // Connect to Milvus
    const milvusClient = getMilvusClient();
    
    try {
      const health = await milvusClient.checkHealth();
      console.log("Milvus connection status:", health);

      // Check if collection exists
      const exists = await milvusClient.hasCollection({
        collection_name: collectionName
      });

      console.log(`Collection ${collectionName} exists: ${JSON.stringify(exists)}`);

      // if (!exists) {
      //   // Create collection with specified parameters
      //   const schema = [
      //     {
      //       name: "id",
      //       description: "id field",
      //       data_type:  DataType.VarChar,
      //       is_primary_key: true,
      //       max_length: 200
      //     },
      //     {
      //       name: "embedding",
      //       description: "vector field",
      //       data_type: DataType.FloatVector,
      //       dim: dimension,
      //     },
      //     {
      //       name: "content",
      //       description: "content field",
      //       data_type: DataType.VarChar,
      //       max_length: 9000,
      //     },
      //     {
      //       name: "metadata",
      //       description: "json field",
      //       data_type: DataType.JSON,
      //     },
      //     {
      //       name: "permission2",
      //       description: "permission field",
      //       data_type: DataType.Array
      //     }
      //   ];

      //   await milvusClient.createCollection({
      //     collection_name: collectionName,
      //     dimension: dimension,
      //     fields: schema
      //   });
      //   console.log(`Created new collection: ${collectionName}`);
      // }

      // Create vector store with specific collection
      const vectorStore = new MilvusVectorStore({
        milvusClient,
        collection: collectionName
      });

      // console.log('--vectorStore--', vectorStore);

      // Create and store embeddings
      const storageContext = await storageContextFromDefaults({ vectorStore });
      console.log('--storageContext--', storageContext);
      
      await VectorStoreIndex.fromDocuments(documents, {
        storageContext: storageContext,
        logProgress: true
      });

      console.log(
        `Successfully created embeddings in Milvus collection: ${collectionName}`
      );

      const updateMany = await DocumentFileModel.updateMany(
        {
          _id: { $in: documentFiles.map((d) => d._id) },
          status: EDocFileStatus.Pending
        },
        { status: EDocFileStatus.Indexed }
      );

      console.log('...updateMany...', updateMany);

      return {
        success: true,
        documentCount: documents.length,
        collectionName: collectionName
      };

    } catch (error) {
      console.error("Milvus operation failed:", error);

      await DocumentFileModel.updateMany(
        {
          _id: { $in: documentFiles.map((d) => d._id) },
          status: EDocFileStatus.Pending
        },
        { status: EDocFileStatus.Failed }
      );

      throw error;
    }

  } catch (error) {
    console.error("Indexing failed:", error);
    throw error;
  }
}

// Utility functions for collection management
export async function listCollections() {
  const milvusClient = getMilvusClient();
  try {
    const collections = await milvusClient.listCollections();
    return collections;
  } catch (error) {
    console.error("Failed to list collections:", error);
    throw error;
  }
}

export async function deleteCollection(collectionName: string) {
  const milvusClient = getMilvusClient();
  try {
    await milvusClient.dropCollection({
      collection_name: collectionName
    });
    console.log(`Deleted collection: ${collectionName}`);
  } catch (error) {
    console.error(`Failed to delete collection ${collectionName}:`, error);
    throw error;
  }
}

export async function getCollectionInfo(collectionName: string) {
  const milvusClient = getMilvusClient();
  try {
    const info = await milvusClient.describeCollection({
      collection_name: collectionName
    });
    return info;
  } catch (error) {
    console.error(`Failed to get info for collection ${collectionName}:`, error);
    throw error;
  }
}

// (async () => {
//   checkRequiredEnvVars();
//   initSettings();
//   await loadAndIndex({
//     collectionName: "local_docs",
//     urls: process.env.SUPPORT_DRIVE_URLS?.split(',') || []
//   });
//   console.log("Finished generating storage.");
// })();


// Example usage
// async function indexMultipleCollections() {
//   checkRequiredEnvVars();
//   initSettings();

//   try {
//     // Index local documents in one collection
//     await loadAndIndex({
//       collectionName: "local_documents",
//       metadata: {
//         description: "Documents from local storage",
//         type: "local"
//       }
//     });

//     // Index Google Drive documents in another collection
//     await loadAndIndex({
//       collectionName: "google_drive_documents",
//       isFromGoogleDrive: true,
//       urls: ["url1", "url2"],
//       metadata: {
//         description: "Documents from Google Drive",
//         type: "google_drive"
//       }
//     });

//     // Index specific project documents in a separate collection
//     await loadAndIndex({
//       collectionName: "project_x_documents",
//       isFromGoogleDrive: true,
//       urls: ["project_url1", "project_url2"],
//       metadata: {
//         description: "Project X documents",
//         project: "Project X",
//         type: "project_specific"
//       }
//     });

//     console.log("Successfully indexed all collections");
//   } catch (error) {
//     console.error("Failed to index collections:", error);
//   }
// }