'use client';

import { useClientConfig } from "./chat/hooks/use-config";

interface DownloadButtonProps {
  fileUrl: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Error type for Google Drive specific errors
class GoogleDriveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleDriveError';
  }
}

/**
 * Extracts file ID from a Google Drive URL
 * @param url - The Google Drive sharing URL
 * @returns The file ID or null if not found
 */
export const extractFileId = (url: string): string | null => {
  const match = url.match(/\/file\/d\/([^/]+)/);
  return match ? match[1] : null;
};

/**
 * Generates a direct download URL for a Google Drive file
 * @param fileId - The Google Drive file ID
 * @returns The direct download URL
 */
export const getGoogleDriveDirectUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * A button component that handles downloading files from Google Drive
 */
export const GoogleDriveFileDownloadButton: React.FC<DownloadButtonProps> = ({ 
  fileUrl, 
  className = '', 
  onSuccess,
  onError
}) => {
  const { backend } = useClientConfig();

  const handleDownload = async (): Promise<void> => {
    try {
      const fileId = extractFileId(fileUrl);
      if (!fileId) {
        throw new GoogleDriveError('Invalid Google Drive URL');
      }
      const downloadUrl = getGoogleDriveDirectUrl(fileId);

      window.open(downloadUrl, '_blank');
      onSuccess?.();

    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
      onError?.(new GoogleDriveError(errorMessage));
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className={className}
      type="button"
    >
      Download File
    </button>
  );
};