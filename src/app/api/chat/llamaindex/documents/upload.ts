import { Document, VectorStoreIndex } from "llamaindex";
import fs from "node:fs/promises";
import path from "node:path";
import { DocumentFile } from "../streaming/annotations";
import { parseFile, storeFile } from "./helper";
import { runPipeline } from "./pipeline";
import { EDocFileStatus } from "db/models/DocumentFile/constants";
import { DocumentFileModel } from "db/models";

export async function uploadDocument(
  index: VectorStoreIndex | null,
  name: string,
  raw: string,
  params?: any
): Promise<DocumentFile> {
  const [header, content] = raw.split(",");
  const mimeType = header.replace("data:", "").replace(";base64", "");
  const fileBuffer = Buffer.from(content, "base64");

  // Store file
  const fileMetadata = await storeFile(name, fileBuffer, mimeType, params?.userId);

  // If the file is csv and has codeExecutorTool, we don't need to index the file.
  // if (mimeType === "text/csv" && (await hasCodeExecutorTool())) {
  //   return fileMetadata;
  // }

  // insert document into mongoDB
  const documentFile = await DocumentFileModel.create({
    name,
    path: fileMetadata.url,
    docIds: [],
    status: EDocFileStatus.Pending,
    permission: params?.permission
  });

  let documentIds: string[] = [];

  try {
    // run the pipeline for other vector store indexes
    const documents: Document[] = await parseFile(
      fileBuffer,
      fileMetadata.name,
      mimeType,
      fileMetadata.url
    );

    documentIds = await runPipeline(index, documents);

    // Update file metadata with document IDs
    fileMetadata.refs = documentIds;

    // Update file status to indexed
    await DocumentFileModel.findByIdAndUpdate(
      documentFile._id,
      {
        docIds: documentIds,
        status: EDocFileStatus.Indexed,
      },
      { new: true }
    );

    return fileMetadata;
  } catch (err) {
    // Update file status to failed
    await DocumentFileModel.findByIdAndUpdate(
      documentFile._id,
      {
        docIds: documentIds,
        status: EDocFileStatus.Failed,
      },
      { new: true }
    );

    throw err;
  }
}

const hasCodeExecutorTool = async () => {
  const codeExecutorTools = ["interpreter", "artifact"];

  const configFile = path.join("config", "tools.json");
  const toolConfig = JSON.parse(await fs.readFile(configFile, "utf8"));

  const localTools = toolConfig.local || {};
  // Check if local tools contains codeExecutorTools
  return codeExecutorTools.some((tool) => localTools[tool] !== undefined);
};
