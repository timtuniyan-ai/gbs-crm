import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Building2, DollarSign, FileText, User, Shield, Calendar, CheckCircle2, Edit, Download, Save, X } from "lucide-react";
import { Brief } from "../types";
import { briefsApi } from "../../lib/api";
import { toast } from "sonner";

interface BriefResponseViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brief: Brief | null;
}

export function BriefResponseViewer({ open, onOpenChange, brief }: BriefResponseViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  
  if (!brief) return null;

  const formData = isEditing ? editedData : (brief.data || {});

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatCurrency = (value: string | number) => {
    if (!value) return 'Не указано';
    return `$${Number(value).toLocaleString('en-US')}`;
  };

  const handleExportToTxt = () => {
    let content = '═══════════════════════════════════════════════════════\n';
    content += '              COMPLETED BRIEF RESPONSES\n';
    content += '═══════════════════════════════════════════════════════\n\n';
    content += `Created: ${formatDate(brief.createdAt.toString())}\n`;
    if (brief.completedAt) {
      content += `Completed: ${formatDate(brief.completedAt.toString())}\n`;
    }
    content += '\n\n';

    // Section 1: Business Info
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += 'РАЗДЕЛ 1: ИНФОРМАЦИЯ О БИЗНЕСЕ\n';
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    content += `Юридическое Название: ${formData.legalName || 'Не указано'}\n`;
    content += `DBA / Торговое Название: ${formData.dbaName || 'Не указано'}\n`;
    content += `Федеральный EIN: ${formData.ein || 'Не указано'}\n`;
    content += `Дата Основания: ${formatDate(formData.foundedDate)}\n`;
    content += `Отрасль / Код NAICS: ${formData.industry || 'Не указано'}\n`;
    content += `Адрес Бизнеса: ${formData.businessAddress || 'Не указано'}\n`;
    content += `Город: ${formData.city || 'Не указано'}\n`;
    content += `Штат: ${formData.state || 'Не указано'}\n`;
    content += `ZIP: ${formData.zip || 'Не указано'}\n`;
    content += `Телефон Бизнеса: ${formData.businessPhone || 'Не указано'}\n`;
    content += `Email Бизнеса: ${formData.businessEmail || 'Не указано'}\n`;
    content += `Веб-сайт: ${formData.website || 'Не указано'}\n`;
    content += `Количество Сотрудников: ${formData.employees || 'Не указано'}\n`;
    content += `Ежемесячная Выручка: ${formatCurrency(formData.monthlyRevenue)}\n`;
    content += `Годовая Выручка: ${formatCurrency(formData.yearlyRevenue)}\n\n`;

    // Section 2: Financing Request
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += 'РАЗДЕЛ 2: ЗАПРОС НА ФИНАНСИРОВАНИЕ\n';
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    content += `Запрашиваемая Сумма: ${formatCurrency(formData.requestedAmount)}\n`;
    content += `Цель Финансирования: ${formData.fundingPurpose || 'Не указано'}\n`;
    content += `Желаемая Структура Платежей: ${formData.desiredPaymentStructure || 'Не указано'}\n`;
    content += `Срок: ${formData.term || 'Не указано'}\n\n`;

    // Section 3: Additional Documents
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += 'РАЗДЕЛ 3: ДОПОЛНИТЕЛЬНЫЕ ДОКУМЕНТЫ\n';
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    content += `Банковские Выписки: ${formData.bankStatements || 'Не загружено'}\n`;
    content += `Налоговые Декларации: ${formData.taxReturns || 'Не загружено'}\n`;
    content += `Другие Документы: ${formData.otherDocuments || 'Не загружено'}\n\n`;

    // Section 4: Owner Info
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += 'РАЗДЕЛ 4: ИНФОРМАЦИЯ О ВЛАДЕЛЬЦЕ\n';
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    content += `Полное Имя: ${formData.ownerName || 'Не указано'}\n`;
    content += `Email: ${formData.ownerEmail || 'Не указано'}\n`;
    content += `Телефон: ${formData.ownerPhone || 'Не указано'}\n`;
    content += `SSN: ${formData.ssn || 'Не указано'}\n`;
    content += `Дата Рождения: ${formatDate(formData.dob)}\n`;
    content += `Домашний Адрес: ${formData.homeAddress || 'Не указано'}\n`;
    content += `Процент Владения: ${formData.ownershipPercentage || 'Не указано'}%\n`;
    content += `Кредитный Рейтинг: ${formData.creditScore || 'Не указано'}\n\n`;

    // Section 5: Declaration
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += 'РАЗДЕЛ 5: ДЕКЛАРАЦИЯ И СОГЛАСИЕ\n';
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    content += `Подпись: ${formData.signature || 'Не указано'}\n`;
    content += `Дата: ${formatDate(formData.signatureDate)}\n\n`;

    content += '═══════════════════════════════════════════════════════\n';
    content += '                   END OF BRIEF\n';
    content += '═══════════════════════════════════════════════════════\n';

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brief-${formData.legalName || 'response'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    setEditedData({ ...brief.data });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!brief) return;
    
    setIsSaving(true);
    try {
      await briefsApi.update(brief.id, { data: editedData });
      brief.data = editedData; // Update local data
      setIsEditing(false);
      toast.success('Изменения успешно сохранены!');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Ошибка при сохранении изменений');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col bg-white overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between mb-3">
            <DialogTitle className="text-2xl">Completed Brief</DialogTitle>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Created: {formatDate(brief.createdAt.toString())}</span>
              {brief.completedAt && (
                <span>Completed: {formatDate(brief.completedAt.toString())}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 border-gray-300 hover:bg-gray-50 h-8 px-3 text-sm"
                    disabled={isSaving}
                  >
                    <X className="w-3.5 h-3.5" />
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 h-8 px-3 text-sm"
                    disabled={isSaving}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 border-gray-300 hover:bg-gray-50 h-8 px-3 text-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Редактировать
                  </Button>
                  <Button
                    onClick={handleExportToTxt}
                    size="sm"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 h-8 px-3 text-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Выгрузить TXT
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto pr-4 custom-scrollbar flex-1">
          <div className="space-y-6 py-4">
            {/* Section 1: Business Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Информация о Бизнесе</CardTitle>
                    <CardDescription>Раздел 1</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoField label="Юридическое Название" value={formData.legalName} isEditing={isEditing} fieldName="legalName" onChange={handleFieldChange} />
                  <InfoField label="DBA / Торговое Название" value={formData.dbaName} isEditing={isEditing} fieldName="dbaName" onChange={handleFieldChange} />
                  <InfoField label="Федеральный EIN" value={formData.ein} isEditing={isEditing} fieldName="ein" onChange={handleFieldChange} />
                  <InfoField label="Дата Основания" value={isEditing ? formData.foundedDate : formatDate(formData.foundedDate)} isEditing={isEditing} fieldName="foundedDate" onChange={handleFieldChange} />
                  <InfoField label="Отрасль / Код NAICS" value={formData.industry} className="md:col-span-2" isEditing={isEditing} fieldName="industry" onChange={handleFieldChange} />
                  <InfoField label="Адрес Бизнеса" value={formData.businessAddress} className="md:col-span-2" isEditing={isEditing} fieldName="businessAddress" onChange={handleFieldChange} />
                  <InfoField label="Город" value={formData.city} isEditing={isEditing} fieldName="city" onChange={handleFieldChange} />
                  <InfoField label="Штат" value={formData.state} isEditing={isEditing} fieldName="state" onChange={handleFieldChange} />
                  <InfoField label="ZIP" value={formData.zip} isEditing={isEditing} fieldName="zip" onChange={handleFieldChange} />
                  <InfoField label="Телефон Бизнеса" value={formData.businessPhone} isEditing={isEditing} fieldName="businessPhone" onChange={handleFieldChange} />
                  <InfoField label="Email Бизнеса" value={formData.businessEmail} isEditing={isEditing} fieldName="businessEmail" onChange={handleFieldChange} />
                  <InfoField label="Веб-сайт" value={formData.website} isEditing={isEditing} fieldName="website" onChange={handleFieldChange} />
                  <InfoField label="Количество Сотрудников" value={formData.employees} isEditing={isEditing} fieldName="employees" onChange={handleFieldChange} />
                  <InfoField label="Ежемесячная Выручка" value={isEditing ? formData.monthlyRevenue : formatCurrency(formData.monthlyRevenue)} isEditing={isEditing} fieldName="monthlyRevenue" onChange={handleFieldChange} />
                  <InfoField label="Годовая Выручка" value={isEditing ? formData.yearlyRevenue : formatCurrency(formData.yearlyRevenue)} isEditing={isEditing} fieldName="yearlyRevenue" onChange={handleFieldChange} />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Financing Request */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Запрос на Финансирование</CardTitle>
                    <CardDescription>Раздел 2</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <InfoField 
                    label="Запрашиваемая Сумма" 
                    value={isEditing ? formData.requestedAmount : formatCurrency(formData.requestedAmount)}
                    className="text-lg font-semibold text-green-700"
                    isEditing={isEditing}
                    fieldName="requestedAmount"
                    onChange={handleFieldChange}
                  />
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Детальное Описание:</Label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {isEditing ? (
                        <Textarea
                          value={formData.purposeDetails || ''}
                          onChange={(e) => handleFieldChange('purposeDetails', e.target.value)}
                          className="min-h-[100px] bg-white"
                        />
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {formData.purposeDetails || 'Не указано'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Current Debts */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Текущие Долги и История</CardTitle>
                    <CardDescription>Раздел 2.1</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <InfoField 
                    label="Текущие бизнес-кредиты" 
                    value={formData.hasCurrentLoans === 'yes' ? 'Да' : 'Нет'}
                  />
                  
                  {formData.hasCurrentLoans === 'yes' && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Детали текущих кредитов:</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {formData.currentLoansDetails || 'Не указано'}
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <InfoField 
                    label="Дефолты или Просрочки (30+ дней)" 
                    value={formData.hasDefaults === 'yes' ? 'Да' : 'Нет'}
                  />

                  {formData.hasDefaults === 'yes' && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Объяснение:</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {formData.defaultsExplanation || 'Не указано'}
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <InfoField 
                    label="Открытое Банкротство" 
                    value={formData.hasBankruptcy === 'yes' ? 'Да' : 'Нет'}
                  />

                  <Separator />

                  <InfoField 
                    label="Отказы в финансировании (последние 6 мес.)" 
                    value={formData.hasRejections === 'yes' ? 'Да' : 'Нет'}
                  />

                  {formData.hasRejections === 'yes' && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Детали отказов:</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {formData.rejectionDetails || 'Не указано'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Owner Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Информация о Владельце</CardTitle>
                    <CardDescription>Раздел 3</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoField label="Полное Имя" value={formData.ownerFullName} isEditing={isEditing} fieldName="ownerFullName" onChange={handleFieldChange} />
                  <InfoField label="Должность" value={formData.ownerTitle} isEditing={isEditing} fieldName="ownerTitle" onChange={handleFieldChange} />
                  <InfoField label="Процент Владения" value={isEditing ? formData.ownershipPercent : (formData.ownershipPercent ? `${formData.ownershipPercent}%` : '')} isEditing={isEditing} fieldName="ownershipPercent" onChange={handleFieldChange} />
                  <InfoField label="SSN/ITIN" value={isEditing ? formData.ssn : (formData.ssn ? '***-**-' + formData.ssn.slice(-4) : 'Не указано')} isEditing={isEditing} fieldName="ssn" onChange={handleFieldChange} />
                  <InfoField label="Дата Рождения" value={isEditing ? formData.ownerDob : formatDate(formData.ownerDob)} isEditing={isEditing} fieldName="ownerDob" onChange={handleFieldChange} />
                  <InfoField label="Водительские Права" value={formData.driverLicense} isEditing={isEditing} fieldName="driverLicense" onChange={handleFieldChange} />
                  <InfoField label="Штат (DL)" value={formData.dlState} isEditing={isEditing} fieldName="dlState" onChange={handleFieldChange} />
                  <InfoField label="Домашний Адрес" value={formData.homeAddress} className="md:col-span-2" isEditing={isEditing} fieldName="homeAddress" onChange={handleFieldChange} />
                  <InfoField label="Город" value={formData.homeCity} isEditing={isEditing} fieldName="homeCity" onChange={handleFieldChange} />
                  <InfoField label="Штат" value={formData.homeState} isEditing={isEditing} fieldName="homeState" onChange={handleFieldChange} />
                  <InfoField label="ZIP" value={formData.homeZip} isEditing={isEditing} fieldName="homeZip" onChange={handleFieldChange} />
                  <InfoField label="Личный Телефон" value={formData.personalPhone} isEditing={isEditing} fieldName="personalPhone" onChange={handleFieldChange} />
                  <InfoField label="Личный Email" value={formData.personalEmail} isEditing={isEditing} fieldName="personalEmail" onChange={handleFieldChange} />
                  <InfoField label="Кредитный Рейтинг" value={isEditing ? formData.creditScore : getCreditScoreLabel(formData.creditScore)} className="md:col-span-2" isEditing={isEditing} fieldName="creditScore" onChange={handleFieldChange} />
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Consent */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Разрешение и Согласие</CardTitle>
                    <CardDescription>Раздел 4</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <ConsentField 
                    label="Согласие с условиями и раскрытиями" 
                    checked={formData.agreeTerms} 
                  />
                  <ConsentField 
                    label="Согласие на коммуникацию" 
                    checked={formData.agreeCommunication} 
                  />
                  <ConsentField 
                    label="Разрешение на проверку кредитной истории" 
                    checked={formData.agreeCreditCheck} 
                  />
                  
                  <Separator className="my-4" />
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Электронная Подпись:</p>
                        <p className="text-base font-semibold text-blue-800">{formData.signature || 'Не указано'}</p>
                        <p className="text-xs text-blue-700 mt-1">Должность: {formData.signatureTitle || 'Не указано'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
function InfoField({ 
  label, 
  value, 
  className = "", 
  isEditing = false, 
  fieldName = "", 
  onChange 
}: { 
  label: string; 
  value: any; 
  className?: string;
  isEditing?: boolean;
  fieldName?: string;
  onChange?: (field: string, value: any) => void;
}) {
  return (
    <div className={`bg-gray-50 p-3 rounded-lg ${className}`}>
      <Label className="text-xs font-medium text-gray-600 mb-1 block">{label}</Label>
      {isEditing && onChange && fieldName ? (
        <Input
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="h-8 text-sm bg-white"
        />
      ) : (
        <p className="text-sm text-gray-900 font-medium">{value || 'Не указано'}</p>
      )}
    </div>
  );
}

function ConsentField({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {checked ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
      <span className="text-sm text-gray-800">{label}</span>
    </div>
  );
}

function getCreditScoreLabel(value: string): string {
  const labels: Record<string, string> = {
    '750+': 'Отличный (750+)',
    '700-749': 'Хороший (700–749)',
    '650-699': 'Средний (650–699)',
    '600-649': 'Ниже Среднего (600-649)',
    '<600': 'Плохой (ниже 600)',
    'unknown': 'Не знаю свой кредитный рейтинг'
  };
  return labels[value] || 'Не указано';
}

