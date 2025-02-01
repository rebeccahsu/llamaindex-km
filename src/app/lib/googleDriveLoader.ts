import { Document } from "llamaindex";
import fetch from "node-fetch";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { processCSV } from "../api/chat/llamaindex/documents/helper";

interface FileMetadata {
  fileId: string;
  mimeType: string;
  fileName: string;
}

export class GoogleDriveLoader {
  private extractResourceInfo(url: string): { id: string; type: 'file' | 'folder' } {
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    const folderMatch = url.match(/\/folders\/([^?/]+)/);
    
    if (fileMatch) return { id: fileMatch[1], type: 'file' };
    if (folderMatch) return { id: folderMatch[1], type: 'folder' };
    
    throw new Error('Invalid Google Drive URL. Must be either a file or folder URL.');
  }

  private getDirectDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  private extractFileNameFromHeader(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;
    
    const filenameMatch = contentDisposition.match(/filename="(.+?)"/) || 
                         contentDisposition.match(/filename\*=UTF-8''(.+)/);
    
    if (filenameMatch && filenameMatch[1]) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }
    return null;
  }

  private async downloadFile(url: string): Promise<{ buffer: ArrayBuffer; fileName: string | null; mimeType: string }> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const contentDisposition = response.headers.get('content-disposition');
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const fileName = this.extractFileNameFromHeader(contentDisposition);

    return {
      buffer: await response.arrayBuffer(),
      fileName,
      mimeType: contentType
    };
  }

  private async processFile(buffer: ArrayBuffer, fileName: string, url: string, mimeType: string): Promise<Document[]> {
    // Determine file type from name or mime type
    const isCSV = fileName.toLowerCase().endsWith('.csv') || 
                 mimeType.includes('text/csv') ||
                 mimeType.includes('application/csv');

    if (isCSV) {
      return processCSV(buffer, fileName, url);
    }

    // Default to PDF processing
    try {
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const loader = new WebPDFLoader(blob);
      const docs = await loader.load();
      
      return docs.map((doc, pageIndex) => {
        const metadata = {
          pageNumber: pageIndex + 1,
          total_pages: docs.length,
          file_path: url,
          file_name: fileName,
          private: false
        };

        return new Document({
          text: doc.pageContent,
          metadata
        });
      });
    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error);
      throw error;
    }
  }

  private async listFolderFiles(folderId: string): Promise<string[]> {
    try {
      const folderUrl = `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;
      const response = await fetch(folderUrl);
      const html = await response.text();

      const fileIds: string[] = [];
      const regex = /\/file\/d\/([^/"]+)/g;
      let match;
      
      while ((match = regex.exec(html)) !== null) {
        if (match[1] && !fileIds.includes(match[1])) {
          fileIds.push(match[1]);
        }
      }

      return fileIds.map(id => `https://drive.google.com/file/d/${id}/view`);
    } catch (error: any) {
      console.error('Error listing folder contents:', error);
      throw new Error(`Failed to list folder contents: ${error?.message}`);
    }
  }

  private async processFolderUrl(url: string): Promise<string[]> {
    const { id } = this.extractResourceInfo(url);
    console.log(`Processing folder: ${url}`);
    return await this.listFolderFiles(id);
  }

  async loadFromUrls(urls: string[]): Promise<Document[]> {
    const documents: Document[] = [];
    const allFileUrls: string[] = [];

    // Process URLs and collect file URLs from folders
    for (const url of urls) {
      try {
        const resourceInfo = this.extractResourceInfo(url);
        
        if (resourceInfo.type === 'folder') {
          const folderFiles = await this.processFolderUrl(url);
          allFileUrls.push(...folderFiles);
        } else {
          allFileUrls.push(url);
        }
      } catch (error: any) {
        console.error(`Error processing URL ${url}:`, error);
        throw new Error(`Failed to process URL ${url}: ${error?.message}`);
      }
    }

    // Process all collected file URLs
    for (const url of allFileUrls) {
      try {
        const { id } = this.extractResourceInfo(url);
        const downloadUrl = this.getDirectDownloadUrl(id);
        
        // Download file with mime type
        const { buffer, fileName, mimeType } = await this.downloadFile(downloadUrl);
        
        const metadata: FileMetadata = {
          fileId: id,
          fileName: fileName || `file-${id}`,
          mimeType
        };

        // Process the file based on its type
        const docs = await this.processFile(buffer, metadata.fileName, url, mimeType);
        documents.push(...docs);
        
      } catch (error: any) {
        console.error(`Error processing URL ${url}:`, error);
        throw new Error(`Failed to process URL ${url}: ${error?.message}`);
      }
    }

    return documents;
  }
}