import { Document } from "llamaindex";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Papa from 'papaparse';
import { getExtractors } from "../../engine/loader";
import { DocumentFile } from "../streaming/annotations";
import { genPreSignedUrl, makePublic } from "@/app/actions/storage";
import { EFolder } from "src/repos/storage";

const MIME_TYPE_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

const UPLOADED_FOLDER = "output/uploaded";

export async function storeAndParseFile(
  name: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<DocumentFile> {
  const file = await storeFile(name, fileBuffer, mimeType);
  const documents: Document[] = await parseFile(fileBuffer, name, mimeType, file.url);
  // Update document IDs in the file metadata
  file.refs = documents.map((document) => document.id_ as string);
  return file;
}

export async function storeFile(
  name: string,
  fileBuffer: Buffer,
  mimeType: string,
  userId: string = "temp",
) {
  /**
   * get presigned url
   */
  const files = await genPreSignedUrl(
    [{
      name: encodeURIComponent(name),
      size: fileBuffer.length,
      mimetype: mimeType
    }],
    userId
  );
  const meta = files[0];
  const id = meta.id;
  /**
   * upload to gcs
   */
  const abortCtrl = new AbortController();
  const res = await fetch(meta.url, {
    signal: abortCtrl.signal,
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'X-Upload-Content-Length': fileBuffer.length.toString(),
    },
    credentials: 'omit',
    body: fileBuffer
  });

  /**
   * make file public
   */
  const { url: fileUrl } = await makePublic(`${EFolder.DocumentFile}/${userId}/${id}`);

  const fileExt = MIME_TYPE_TO_EXT[mimeType];
  if (!fileExt) throw new Error(`Unsupported document type: ${mimeType}`);

  const fileId = crypto.randomUUID();
  const sanitizedFileName = sanitizeFileName(name);
  const newFilename = `${/^_+$/.test(sanitizedFileName) ? '' : sanitizedFileName}_${fileId}.${fileExt}`;

  const hasCorrectExt = name.toLowerCase().endsWith(`.${fileExt.toLowerCase()}`);
  const baseFileName = hasCorrectExt ? name : `${name}.${fileExt}`;

  return {
    id: fileId,
    name: baseFileName,
    size: fileBuffer.length,
    type: fileExt,
    url: fileUrl,
    refs: [] as string[]
  } as DocumentFile;
}

export async function parseFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  url: string,
) {
  const documents = await loadDocuments(fileBuffer, mimeType, filename, url);
  for (const document of documents) {
    document.metadata = {
      ...document.metadata,
      file_name: filename,
      file_path: url,
      private: "false",
      created_at: new Date().toISOString(),
    };
  }
  return documents;
}

async function loadDocuments(fileBuffer: Buffer, mimeType: string, filename: string, url: string) {
  const extractors = getExtractors();
  const reader = extractors[MIME_TYPE_TO_EXT[mimeType]];

  if (!reader) {
    throw new Error(`Unsupported document type: ${mimeType}`);
  }
  console.log(`Processing uploaded document of type: ${mimeType}`);

  const isCSV = mimeType.includes('text/csv') || mimeType.includes('application/csv');

  if (isCSV) {
    return processCSV(fileBuffer, filename, url);
  }

  return await reader.loadDataAsContent(fileBuffer);
}

// Save document to file server and return the file url
export async function saveDocument(filepath: string, content: string | Buffer) {
  if (path.isAbsolute(filepath)) {
    throw new Error("Absolute file paths are not allowed.");
  }
  if (!process.env.FILESERVER_URL_PREFIX) {
    throw new Error("FILESERVER_URL_PREFIX environment variable is not set.");
  }

  const dirPath = path.dirname(filepath);
  await fs.promises.mkdir(dirPath, { recursive: true });

  if (typeof content === "string") {
    await fs.promises.writeFile(filepath, content, "utf-8");
  } else {
    await fs.promises.writeFile(filepath, content);
  }

  const fileurl = `${process.env.FILESERVER_URL_PREFIX}/${filepath}`;
  console.log(`Saved document to ${filepath}. Reachable at URL: ${fileurl}`);
  return fileurl;
}

function sanitizeFileName(fileName: string) {
  // Remove file extension and sanitize
  return fileName.split(".")[0].replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function processCSV(buffer: ArrayBuffer, fileName: string, url: string): Promise<Document[]> {
  try {
    // Convert ArrayBuffer to string
    const decoder = new TextDecoder('utf-8');
    const csvString = decoder.decode(buffer);

    return new Promise((resolve, reject) => {
      interface CSVMetadata {
        row_number: number;
        total_rows: number;
        file_path: string;
        file_name: string;
        headers: string;
        private: boolean;
      }

      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<Record<string, string>>) => {
          const documents: Document[] = results.data.map((row: Record<string, string>, index: number) => {
            // Convert row object to string representation
            const rowString: string = Object.entries(row)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');

            const metadata: CSVMetadata = {
              row_number: index + 1,
              total_rows: results.data.length,
              file_path: url,
              file_name: fileName,
              headers: results.meta.fields ? JSON.stringify(results.meta.fields) : '[]',
              private: false
            };

            return new Document({
              text: rowString,
              metadata
            });
          });

          resolve(documents);
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error(`Error processing CSV file ${fileName}:`, error);
    throw error;
  }
}
