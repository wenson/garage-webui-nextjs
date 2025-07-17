"use client";

import FileUploadComponent from "@/components/upload/file-upload";

interface UploadModalProps {
  bucketId: string;
  bucketName: string;
  currentPrefix: string;
  showUpload: boolean;
  onUploadComplete: () => void;
  onClose: () => void;
}

export function UploadModal({
  bucketId,
  bucketName,
  currentPrefix,
  showUpload,
  onUploadComplete,
  onClose
}: UploadModalProps) {
  if (!showUpload) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full mx-4">
        <FileUploadComponent
          bucketId={bucketId}
          bucketName={bucketName}
          currentPrefix={currentPrefix}
          onUploadComplete={onUploadComplete}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
