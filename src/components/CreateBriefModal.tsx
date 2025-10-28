import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Copy, CheckCircle, FileText, Globe, Sparkles, ExternalLink, Lock } from "lucide-react";
import { BriefDocumentType, BriefLanguage } from "../types";

interface CreateBriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBrief: (documentType: BriefDocumentType, language: BriefLanguage) => Promise<{ token: string; accessCode: string; briefUrl: string }>;
  clientName: string;
}

const DOCUMENT_TYPES = [
  { value: 'business_application' as BriefDocumentType, label: 'Business Application', description: 'Business financing application' },
  { value: 'marketing_brief' as BriefDocumentType, label: 'Marketing Brief', description: 'Marketing project brief' },
  { value: 'technical_brief' as BriefDocumentType, label: 'Technical Brief', description: 'Technical project brief' },
];

const LANGUAGES = [
  { value: 'ru' as BriefLanguage, label: 'Русский', flag: '🇷🇺' },
  { value: 'en' as BriefLanguage, label: 'English', flag: '🇺🇸' },
];

export function CreateBriefModal({ open, onOpenChange, onCreateBrief, clientName }: CreateBriefModalProps) {
  const [documentType, setDocumentType] = useState<BriefDocumentType>('business_application');
  const [language, setLanguage] = useState<BriefLanguage>('ru');
  const [isCreating, setIsCreating] = useState(false);
  const [createdBrief, setCreatedBrief] = useState<{ token: string; accessCode: string; briefUrl: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'url' | 'code' | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const result = await onCreateBrief(documentType, language);
      setCreatedBrief(result);
    } catch (error) {
      console.error('Error creating brief:', error);
      alert('Error creating brief. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (text: string, field: 'url' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    setCreatedBrief(null);
    setDocumentType('business_application');
    setLanguage('ru');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Create Brief for Client</DialogTitle>
              <DialogDescription>
                Create a personalized brief for <strong className="text-blue-600">{clientName}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!createdBrief ? (
          <div className="space-y-6">
            {/* Document Type */}
            <div className="space-y-3">
              <Label htmlFor="document-type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Document Type
              </Label>
              <Select value={documentType} onValueChange={(value) => setDocumentType(value as BriefDocumentType)}>
                <SelectTrigger className="bg-white border-2 border-gray-300 shadow-sm hover:border-blue-400 transition-colors h-auto py-3 px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-semibold text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <Label htmlFor="language" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                Language
              </Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as BriefLanguage)}>
                <SelectTrigger className="bg-white border-2 border-gray-300 shadow-sm hover:border-purple-400 transition-colors h-12 px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                <span>A unique link and PIN code will be generated for the client to fill out the brief securely.</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t">
              <Button 
                onClick={handleCreate} 
                disabled={isCreating} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md h-11"
              >
                {isCreating ? 'Creating...' : 'Create Brief'}
              </Button>
              <Button variant="outline" onClick={handleClose} className="bg-white hover:bg-gray-50">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center py-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-1">Brief Created Successfully!</h3>
              <p className="text-sm text-green-700">Share the link and PIN code with your client</p>
            </div>

            {/* Client Link */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                Client Link
              </Label>
              <div className="flex gap-2">
                <Input
                  value={createdBrief.briefUrl}
                  readOnly
                  className="text-xs font-mono bg-white border-gray-300"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(createdBrief.briefUrl, 'url')}
                  className="shrink-0 bg-white hover:bg-gray-100"
                >
                  {copiedField === 'url' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* PIN Code */}
            <div className="space-y-3 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg border-2 border-indigo-200 shadow-sm">
              <Label className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                Access PIN Code
              </Label>
              <div className="flex gap-2">
                <Input
                  value={createdBrief.accessCode}
                  readOnly
                  className="text-center text-3xl font-mono tracking-widest bg-white border-2 border-indigo-300 text-indigo-900 font-bold h-14"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(createdBrief.accessCode, 'code')}
                  className="shrink-0 bg-white hover:bg-indigo-100 border-2 border-indigo-300 h-14 px-4"
                >
                  {copiedField === 'code' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-indigo-600" />
                  )}
                </Button>
              </div>
            </div>

            {/* Info Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <span>The client can fill out the brief using the link and PIN code. Progress will be saved automatically.</span>
              </p>
            </div>

            {/* Done Button */}
            <Button 
              onClick={handleClose} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md h-11"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
