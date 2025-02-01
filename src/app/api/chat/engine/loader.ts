import { GoogleDriveLoader } from "@/app/lib/googleDriveLoader";
import {
  FILE_EXT_TO_READER,
  SimpleDirectoryReader,
} from "llamaindex/readers/SimpleDirectoryReader";

export const DATA_DIR = "./data";

export function getExtractors() {
  return FILE_EXT_TO_READER;
}

export async function getDocuments(urls: undefined | string[]) {
  console.log('--------get documents--------');

  let documents;
  if (urls?.length) {
    const driveLoader = new GoogleDriveLoader();
    documents = await driveLoader.loadFromUrls(urls);
    console.log(`Loaded ${documents.length} documents from Google Drive.`);
  } else {
    documents = await new SimpleDirectoryReader().loadData({
      directoryPath: DATA_DIR,
    });
    console.log(`Loaded ${documents.length} documents.`);
  }
  // Set private=false to mark the document as public (required for filtering)
  for (const document of documents) {
    console.log("document metadata", document.metadata);
    document.metadata = {
      ...document.metadata,
      headers: document.metadata.headers ? JSON.stringify(document.metadata.headers) : undefined,
      private: "false",
    };

    console.log("the document", document);
  }
  return documents;
}
