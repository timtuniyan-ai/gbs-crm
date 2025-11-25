import React from "react";
import { Button } from "./ui/button";
import { Trash2, File, Image, FileVideo, FileAudio, FileText, Eye, Edit } from "lucide-react";
import { Document } from "../types";

interface DocumentCardProps {
  document: Document;
  onPreview: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onRename: (documentId: string) => void;
}

export function DocumentCard({ document, onPreview, onDelete, onRename }: DocumentCardProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return FileVideo;
    if (fileType.startsWith('audio/')) return FileAudio;
    if (fileType === 'application/pdf') return FileText;
    return File;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isImage = document.file_type.startsWith('image/');
  const isPDF = document.file_type === 'application/pdf';
  
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
  
  const FileIcon = getFileIcon(document.file_type);

  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Preview Area */}
      <div 
        className="aspect-[3/2] bg-gray-50 flex items-center justify-center relative overflow-hidden cursor-pointer"
        onClick={() => onPreview(document)}
      >
        {isImage ? (
          <img
            src={document.file_url}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : isPDF ? (
          <div className="w-full h-full relative">
            <iframe
              src={`${document.file_url}#page=1&view=FitH`}
              className="w-full h-full pointer-events-none"
              title={document.name}
            />
            {/* Overlay для PDF чтобы клик работал */}
            <div className="absolute inset-0 bg-transparent" />
          </div>
        ) : isOfficeDoc ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
            <div className="text-center text-white">
              <FileIcon className="w-10 h-10 mx-auto mb-1" />
              <p className="text-[8px] font-medium uppercase tracking-wide">
                {isWord ? 'Word' : isExcel ? 'Excel' : 'PowerPoint'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <FileIcon className="w-10 h-10 text-gray-600" />
          </div>
        )}
        
        {/* Eye icon on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-2 border-t border-gray-100">
        <h4 className="font-medium text-xs text-gray-900 truncate mb-1">
          {document.name}
        </h4>
        
        {document.comment && (
          <p className="text-[10px] text-gray-600 truncate mb-1">
            {document.comment}
          </p>
        )}
        
        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
          <span>{document.file_size}</span>
          <span>{formatTimestamp(document.created_at)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onRename(document.id);
            }}
            className="flex-1 text-[10px] h-6"
          >
            <Edit className="w-3 h-3 mr-1" />
            Rename
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(document.id);
            }}
            className="text-[10px] h-6 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

