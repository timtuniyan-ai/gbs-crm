import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Copy, CheckCircle, ExternalLink, Trash2, AlertCircle, Eye, FileText, Globe, Calendar, Clock } from "lucide-react";
import { Brief } from "../types";
import { formatDateTimeCompact } from "../utils/dateUtils";
import { BriefResponseViewer } from "./BriefResponseViewer";

interface BriefDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brief: Brief | null;
  onDelete: (briefId: string) => void;
}

export function BriefDetailsModal({ open, onOpenChange, brief, onDelete }: BriefDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<'url' | 'code' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResponseViewer, setShowResponseViewer] = useState(false);

  if (!brief) return null;

  const briefUrl = `${window.location.origin}/brief/${brief.token}`;

  const handleCopy = async (text: string, field: 'url' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this brief? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(brief.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting brief:', error);
      alert('Error deleting brief');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenLink = () => {
    window.open(briefUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Brief Details</DialogTitle>
              <DialogDescription>
                Manage brief information and share with client
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Brief Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Type</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {brief.documentType === 'business_application' ? 'Business Application' :
                 brief.documentType === 'marketing_brief' ? 'Marketing Brief' :
                 'Technical Brief'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Language</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {brief.language === 'ru' ? '🇷🇺 Русский' : '🇺🇸 English'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Status</span>
              </div>
              <Badge className={
                brief.status === 'completed' ? 'bg-green-600 hover:bg-green-700' :
                brief.status === 'in_progress' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-orange-600 hover:bg-orange-700'
              }>
                {brief.status === 'completed' ? '✓ Completed' : 
                 brief.status === 'in_progress' ? '● In Progress' : '○ Created'}
              </Badge>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Created</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatDateTimeCompact(brief.createdAt)}</p>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Client Link
            </Label>
            <div className="flex gap-2">
              <Input
                value={briefUrl}
                readOnly
                className="text-xs font-mono bg-white border-gray-300"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(briefUrl, 'url')}
                className="shrink-0 bg-white hover:bg-gray-100"
              >
                {copiedField === 'url' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenLink}
                className="shrink-0 bg-white hover:bg-gray-100"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* PIN Code */}
          <div className="space-y-3 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
            <Label className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Access PIN Code
            </Label>
            <div className="flex gap-2">
              <Input
                value={brief.accessCode}
                readOnly
                className="text-center text-2xl font-mono tracking-widest bg-white border-indigo-300 text-indigo-900 font-bold"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(brief.accessCode, 'code')}
                className="shrink-0 bg-white hover:bg-indigo-100 border-indigo-300"
              >
                {copiedField === 'code' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-indigo-600" />
                )}
              </Button>
            </div>
          </div>

          {/* Warning */}
          {brief.status === 'created' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg flex items-start gap-3 border border-blue-200">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-900">
                Client hasn't started filling out the brief yet. Send them the link and PIN code.
              </p>
            </div>
          )}

          {/* Completed Notice */}
          {brief.status === 'completed' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg flex items-start gap-3 border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-900 font-medium">
                Brief successfully completed by client. You can view all responses.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            {brief.status === 'completed' && (
              <Button
                onClick={() => setShowResponseViewer(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Eye className="w-4 h-4" />
                View Responses
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Response Viewer */}
      <BriefResponseViewer
        open={showResponseViewer}
        onOpenChange={setShowResponseViewer}
        brief={brief}
      />
    </Dialog>
  );
}

