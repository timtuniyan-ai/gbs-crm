import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Building2, DollarSign, FileText, User, Shield, Calendar, CheckCircle2 } from "lucide-react";
import { Brief } from "../types";

interface BriefResponseViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brief: Brief | null;
}

export function BriefResponseViewer({ open, onOpenChange, brief }: BriefResponseViewerProps) {
  if (!brief) return null;

  const formData = brief.data || {};

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatCurrency = (value: string | number) => {
    if (!value) return 'Не указано';
    return `$${Number(value).toLocaleString('en-US')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col bg-white overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Completed Brief</DialogTitle>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>Created: {formatDate(brief.createdAt.toString())}</span>
            {brief.completedAt && (
              <span>Completed: {formatDate(brief.completedAt.toString())}</span>
            )}
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
                  <InfoField label="Юридическое Название" value={formData.legalName} />
                  <InfoField label="DBA / Торговое Название" value={formData.dbaName} />
                  <InfoField label="Федеральный EIN" value={formData.ein} />
                  <InfoField label="Дата Основания" value={formatDate(formData.foundedDate)} />
                  <InfoField label="Отрасль / Код NAICS" value={formData.industry} className="md:col-span-2" />
                  <InfoField label="Адрес Бизнеса" value={formData.businessAddress} className="md:col-span-2" />
                  <InfoField label="Город" value={formData.city} />
                  <InfoField label="Штат" value={formData.state} />
                  <InfoField label="ZIP" value={formData.zip} />
                  <InfoField label="Телефон Бизнеса" value={formData.businessPhone} />
                  <InfoField label="Email Бизнеса" value={formData.businessEmail} />
                  <InfoField label="Веб-сайт" value={formData.website} />
                  <InfoField label="Количество Сотрудников" value={formData.employees} />
                  <InfoField label="Ежемесячная Выручка" value={formatCurrency(formData.monthlyRevenue)} />
                  <InfoField label="Годовая Выручка" value={formatCurrency(formData.yearlyRevenue)} />
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
                    value={formatCurrency(formData.requestedAmount)}
                    className="text-lg font-semibold text-green-700"
                  />
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Цели Кредита:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.loanPurpose?.map((purpose: string) => (
                        <Badge key={purpose} variant="secondary">
                          {purpose}
                        </Badge>
                      )) || <span className="text-sm text-gray-500">Не указано</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Детальное Описание:</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {formData.purposeDetails || 'Не указано'}
                      </p>
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
                  <InfoField label="Полное Имя" value={formData.ownerFullName} />
                  <InfoField label="Должность" value={formData.ownerTitle} />
                  <InfoField label="Процент Владения" value={formData.ownershipPercent ? `${formData.ownershipPercent}%` : ''} />
                  <InfoField label="SSN/ITIN" value={formData.ssn ? '***-**-' + formData.ssn.slice(-4) : 'Не указано'} />
                  <InfoField label="Дата Рождения" value={formatDate(formData.ownerDob)} />
                  <InfoField label="Водительские Права" value={formData.driverLicense} />
                  <InfoField label="Штат (DL)" value={formData.dlState} />
                  <InfoField label="Домашний Адрес" value={formData.homeAddress} className="md:col-span-2" />
                  <InfoField label="Город" value={formData.homeCity} />
                  <InfoField label="Штат" value={formData.homeState} />
                  <InfoField label="ZIP" value={formData.homeZip} />
                  <InfoField label="Личный Телефон" value={formData.personalPhone} />
                  <InfoField label="Личный Email" value={formData.personalEmail} />
                  <InfoField label="Кредитный Рейтинг" value={getCreditScoreLabel(formData.creditScore)} className="md:col-span-2" />
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
function InfoField({ label, value, className = "" }: { label: string; value: any; className?: string }) {
  return (
    <div className={`bg-gray-50 p-3 rounded-lg ${className}`}>
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value || 'Не указано'}</p>
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

