import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
import { Document } from "../types";

interface DocumentPreviewModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewModal({
  document,
  open,
  onOpenChange,
}: DocumentPreviewModalProps) {
  if (!document) return null;

  const isImage = document.file_type.startsWith('image/');
  const isPDF = document.file_type === 'application/pdf';
  const isVideo = document.file_type.startsWith('video/');
  
  // Office документы
  const isWord = document.file_type.includes('word') || 
                 document.file_type.includes('msword') ||
                 document.name.endsWith('.doc') || 
                 document.name.endsWith('.docx');
  const isExcel = document.file_type.includes('excel') || 
                  document.file_type.includes('spreadsheet') ||
                  document.name.endsWith('.xls') || 
                  document.name.endsWith('.xlsx');
  const isPowerPoint = document.file_type.includes('presentation') || 
                       document.file_type.includes('powerpoint') ||
                       document.name.endsWith('.ppt') || 
                       document.name.endsWith('.pptx');
  
  const isOfficeDoc = isWord || isExcel || isPowerPoint;
  
  // URL для Google Docs Viewer
  const officeViewerUrl = isOfficeDoc 
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.file_url)}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[98vw] sm:w-[95vw] h-[98vh] sm:h-[95vh] overflow-hidden border border-gray-200 flex flex-col p-0 bg-white">
        <DialogHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6 shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-gray-900 text-base sm:text-lg truncate">
                {document.name}
              </DialogTitle>
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 mt-1">
                <span>{document.file_size}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Uploaded by {document.created_by_name}</span>
              </div>
            </div>
            
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-50 p-2 sm:p-4 md:p-6">
          <div className="h-full flex items-center justify-center">
            {isImage ? (
              <img
                src={document.file_url}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            ) : isPDF ? (
              <iframe
                src={document.file_url}
                className="w-full h-full rounded-lg shadow-lg bg-white"
                title={document.name}
              />
            ) : isVideo ? (
              <video
                src={document.file_url}
                controls
                className="max-w-full max-h-full rounded-lg shadow-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : isOfficeDoc && officeViewerUrl ? (
              <iframe
                src={officeViewerUrl}
                className="w-full h-full rounded-lg shadow-lg bg-white"
                title={document.name}
              />
            ) : (
              <div className="text-center px-4">
                <FileText className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Preview not available
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  This file type cannot be previewed in the browser
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

