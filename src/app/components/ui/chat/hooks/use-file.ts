"use client";

import { JSONValue } from "llamaindex";
import { useState } from "react";
import {
  DocumentFile,
  DocumentFileType,
  MessageAnnotation,
  MessageAnnotationType,
} from "..";
import { useClientConfig } from "./use-config";
import { useAppStore, useUserStore } from "src/stores";

const docMineTypeMap: Record<string, DocumentFileType> = {
  "text/csv": "csv",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export function useFile() {
  const { backend } = useClientConfig();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const { collectionName } = useAppStore();
  const { profile } = useUserStore();

  const addDoc = (file: DocumentFile) => {
    const existedFile = files.find((f) => f.id === file.id);
    if (!existedFile) {
      setFiles((prev) => [...prev, file]);
      return true;
    }
    return false;
  };

  const removeDoc = (file: DocumentFile) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  const reset = () => {
    imageUrl && setImageUrl(null);
    files.length && setFiles([]);
  };

  const uploadContent = async (
    file: File,
    requestParams: any = {},
    metadata: any = {},
  ): Promise<DocumentFile> => {
    const base64 = await readContent({ file: file, asUrl: true });
    const uploadAPI = `${backend}/api/import-local`;
    const response = await fetch(uploadAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...requestParams,
        base64,
        name: metadata?.customFileName || file.name,
        params: {
          collectionName,
          userId: profile?.id || "temp",
          ...metadata
        }
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    };

    return (await response.json()) as DocumentFile;
  };

  const getAnnotations = () => {
    const annotations: MessageAnnotation[] = [];
    if (imageUrl) {
      annotations.push({
        type: MessageAnnotationType.IMAGE,
        data: { url: imageUrl },
      });
    }
    if (files.length > 0) {
      annotations.push({
        type: MessageAnnotationType.DOCUMENT_FILE,
        data: { files },
      });
    }
    return annotations as JSONValue[];
  };

  const readContent = async (input: {
    file: File;
    asUrl?: boolean;
  }): Promise<string> => {
    const { file, asUrl } = input;
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      if (asUrl) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
    return content;
  };

  const uploadFile = async (file: File, metadata: any = {}, requestParams: any = {}) => {
    if (file.type.startsWith("image/")) {
      const base64 = await readContent({ file, asUrl: true });
      return setImageUrl(base64);
    }

    const filetype = docMineTypeMap[file.type];
    if (!filetype) throw new Error("Unsupported document type.");

    const newDoc = await uploadContent(file, requestParams, metadata);
  
    return addDoc(newDoc);
  };

  return {
    imageUrl,
    setImageUrl,
    files,
    removeDoc,
    reset,
    getAnnotations,
    uploadFile,
  };
}
