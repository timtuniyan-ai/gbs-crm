import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { ChevronLeft, ChevronRight, Save, Send, DollarSign, User, FileText, Shield, Building2 } from "lucide-react";
import { Brief } from "../types";
import { briefsApi } from "../../lib/api";

interface BriefFormProps {
  brief: Brief;
  onComplete: () => void;
}

const TOTAL_STEPS = 5;

export function BriefForm({ brief, onComplete }: BriefFormProps) {
  const [currentStep, setCurrentStep] = useState(brief.currentStep || 1);
  const [formData, setFormData] = useState(brief.data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await briefsApi.updateProgress(brief.id, currentStep, formData, 'in_progress');
      setSaveMessage("✓ Черновик сохранен");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveMessage("✗ Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSaveDraft();
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await briefsApi.updateProgress(brief.id, TOTAL_STEPS, formData, 'completed');
      onComplete();
    } catch (error) {
      console.error('Error submitting brief:', error);
      alert('Ошибка при отправке брифа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BusinessInfo formData={formData} updateField={updateField} />;
      case 2:
        return <Step2FinancingRequest formData={formData} updateField={updateField} />;
      case 3:
        return <Step3CurrentDebts formData={formData} updateField={updateField} />;
      case 4:
        return <Step4OwnerInfo formData={formData} updateField={updateField} />;
      case 5:
        return <Step5Consent formData={formData} updateField={updateField} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo.svg" 
            alt="Grand Business Solutions Logo" 
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GRAND BUSINESS SOLUTIONS
          </h1>
          <p className="text-lg text-blue-600 font-semibold mb-1">
            One Decision Changes Everything
          </p>
          <p className="text-sm text-gray-600">
            Помогаем бизнесу получать оптимальное финансирование с 2010 года
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 border-2 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Шаг {currentStep} из {TOTAL_STEPS}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="mt-2 text-xs text-gray-500 text-center">
              {getStepTitle(currentStep)}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card className="mb-6 shadow-xl border-2 border-gray-100">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </Button>

          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </span>
            )}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>

          {currentStep < TOTAL_STEPS ? (
            <Button onClick={handleNext} className="flex items-center gap-2">
              Далее
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
          )}
        </div>

        {/* Save Draft Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Save className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Сохраните свой прогресс
                </p>
                <p className="text-xs text-blue-700">
                  Вы можете сохранить бриф как черновик и вернуться к заполнению позже, используя ту же ссылку и PIN-код. Ваши данные будут сохранены автоматически при переходе между шагами.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600" style={{ marginBottom: '3rem' }}>
          <p className="mb-2">Есть вопросы? Свяжитесь с нами:</p>
          <p>📧 info@grandsolutions.org | 📞 +1 (215) 688 0020</p>
        </div>
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  const titles = [
    "Информация о бизнесе",
    "Запрос на финансирование",
    "Текущие долги и история",
    "Информация о владельце",
    "Разрешение и согласие"
  ];
  return titles[step - 1] || "";
}

// Step Components
function Step1BusinessInfo({ formData, updateField }: any) {
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Раздел 1 — Информация о Бизнесе</CardTitle>
            <CardDescription>Расскажите нам о вашей компании</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="legalName">Юридическое Название Компании *</Label>
          <Input
            id="legalName"
            placeholder="ABC Construction LLC"
            value={formData.legalName || ''}
            onChange={(e) => updateField('legalName', e.target.value)}
          />
          <p className="text-xs text-gray-500">По документам IRS</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dbaName">DBA / Торговое Название</Label>
          <Input
            id="dbaName"
            placeholder="Оставьте пустым, если совпадает"
            value={formData.dbaName || ''}
            onChange={(e) => updateField('dbaName', e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ein">Федеральный EIN *</Label>
            <Input
              id="ein"
              placeholder="XX-XXXXXXX"
              value={formData.ein || ''}
              onChange={(e) => updateField('ein', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedDate">Дата Основания *</Label>
            <Input
              id="foundedDate"
              type="date"
              value={formData.foundedDate || ''}
              onChange={(e) => updateField('foundedDate', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Отрасль / Код NAICS *</Label>
          <Input
            id="industry"
            placeholder="Строительство (236220)"
            value={formData.industry || ''}
            onChange={(e) => updateField('industry', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Физический Адрес Бизнеса *</Label>
          <Input
            id="businessAddress"
            placeholder="Адрес, по которому работает бизнес"
            value={formData.businessAddress || ''}
            onChange={(e) => updateField('businessAddress', e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Город *</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Штат *</Label>
            <Input
              id="state"
              placeholder="CA"
              maxLength={2}
              value={formData.state || ''}
              onChange={(e) => updateField('state', e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP *</Label>
            <Input
              id="zip"
              placeholder="12345"
              value={formData.zip || ''}
              onChange={(e) => updateField('zip', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Телефон Бизнеса *</Label>
            <Input
              id="businessPhone"
              type="tel"
              placeholder="+1 (XXX) XXX-XXXX"
              value={formData.businessPhone || ''}
              onChange={(e) => updateField('businessPhone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessEmail">Email Бизнеса *</Label>
            <Input
              id="businessEmail"
              type="email"
              value={formData.businessEmail || ''}
              onChange={(e) => updateField('businessEmail', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Веб-сайт Бизнеса</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employees">Количество Сотрудников *</Label>
            <Input
              id="employees"
              type="number"
              min="1"
              value={formData.employees || ''}
              onChange={(e) => updateField('employees', e.target.value)}
            />
            <p className="text-xs text-gray-500">Включая W-2 и 1099</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRevenue">Ежемесячная Выручка *</Label>
            <Input
              id="monthlyRevenue"
              type="number"
              placeholder="$50,000"
              value={formData.monthlyRevenue || ''}
              onChange={(e) => updateField('monthlyRevenue', e.target.value)}
            />
            <p className="text-xs text-gray-500">Среднее за 3 месяца</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearlyRevenue">Годовая Валовая Выручка *</Label>
          <Input
            id="yearlyRevenue"
            type="number"
            placeholder="$600,000"
            value={formData.yearlyRevenue || ''}
            onChange={(e) => updateField('yearlyRevenue', e.target.value)}
          />
          <p className="text-xs text-gray-500">За последние 12 месяцев</p>
        </div>
      </CardContent>
    </>
  );
}

function Step2FinancingRequest({ formData, updateField }: any) {
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Раздел 2 — Запрос на Финансирование</CardTitle>
            <CardDescription>Расскажите о ваших потребностях в финансировании</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requestedAmount">Запрашиваемая Сумма Кредита *</Label>
          <Input
            id="requestedAmount"
            type="number"
            placeholder="$100,000"
            value={formData.requestedAmount || ''}
            onChange={(e) => updateField('requestedAmount', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Основная Цель Кредита *</Label>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              'Оборотный Капитал',
              'Покупка Оборудования',
              'Закупка Товаров/Инвентаря',
              'Расширение Бизнеса',
              'Консолидация/Рефинансирование Долгов',
              'Маркетинг/Реклама',
              'Покупка Недвижимости',
              'Кредитная Линия',
              'Заработная Плата',
              'Сезонный Денежный Поток'
            ].map((purpose) => (
              <label key={purpose} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.loanPurpose?.includes(purpose) || false}
                  onChange={(e) => {
                    const current = formData.loanPurpose || [];
                    const updated = e.target.checked
                      ? [...current, purpose]
                      : current.filter((p: string) => p !== purpose);
                    updateField('loanPurpose', updated);
                  }}
                  className="rounded"
                />
                <span className="text-sm">{purpose}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purposeDetails">Детальное Описание Использования Средств *</Label>
          <Textarea
            id="purposeDetails"
            rows={6}
            placeholder="Будьте конкретны: Если оборудование - укажите Марку, Модель, Год, VIN. Если товары - какие именно. Если расширение - опишите проект..."
            value={formData.purposeDetails || ''}
            onChange={(e) => updateField('purposeDetails', e.target.value)}
          />
        </div>
      </CardContent>
    </>
  );
}

function Step3CurrentDebts({ formData, updateField }: any) {
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Раздел 2.1 — Текущие Долги и История</CardTitle>
            <CardDescription>Информация о существующем финансировании</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Имеются ли у вас в настоящее время бизнес-кредиты? *</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasCurrentLoans"
                checked={formData.hasCurrentLoans === 'yes'}
                onChange={() => updateField('hasCurrentLoans', 'yes')}
              />
              <span>Да</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasCurrentLoans"
                checked={formData.hasCurrentLoans === 'no'}
                onChange={() => updateField('hasCurrentLoans', 'no')}
              />
              <span>Нет</span>
            </label>
          </div>
        </div>

        {formData.hasCurrentLoans === 'yes' && (
          <div className="space-y-2">
            <Label htmlFor="currentLoansDetails">Детали Текущих Кредитов</Label>
            <Textarea
              id="currentLoansDetails"
              rows={4}
              placeholder="Название кредитора, тип кредита, остаток долга, ежемесячный платёж..."
              value={formData.currentLoansDetails || ''}
              onChange={(e) => updateField('currentLoansDetails', e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Были ли у вас Дефолты или Просрочки (30+ дней) за последние 3 года? *</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasDefaults"
                checked={formData.hasDefaults === 'yes'}
                onChange={() => updateField('hasDefaults', 'yes')}
              />
              <span>Да</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasDefaults"
                checked={formData.hasDefaults === 'no'}
                onChange={() => updateField('hasDefaults', 'no')}
              />
              <span>Нет</span>
            </label>
          </div>
        </div>

        {formData.hasDefaults === 'yes' && (
          <div className="space-y-2">
            <Label htmlFor="defaultsExplanation">Объяснение Дефолтов</Label>
            <Textarea
              id="defaultsExplanation"
              rows={3}
              placeholder="Дата, кредитор, сумма, текущий статус..."
              value={formData.defaultsExplanation || ''}
              onChange={(e) => updateField('defaultsExplanation', e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Имеется ли у вас в настоящее время Открытое Банкротство? *</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasBankruptcy"
                checked={formData.hasBankruptcy === 'yes'}
                onChange={() => updateField('hasBankruptcy', 'yes')}
              />
              <span>Да</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasBankruptcy"
                checked={formData.hasBankruptcy === 'no'}
                onChange={() => updateField('hasBankruptcy', 'no')}
              />
              <span>Нет</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Получали ли вы отказ в финансировании за последние 6 месяцев? *</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasRejections"
                checked={formData.hasRejections === 'yes'}
                onChange={() => updateField('hasRejections', 'yes')}
              />
              <span>Да</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasRejections"
                checked={formData.hasRejections === 'no'}
                onChange={() => updateField('hasRejections', 'no')}
              />
              <span>Нет</span>
            </label>
          </div>
        </div>

        {formData.hasRejections === 'yes' && (
          <div className="space-y-2">
            <Label htmlFor="rejectionDetails">Детали Отказов</Label>
            <Textarea
              id="rejectionDetails"
              rows={3}
              placeholder="Кредитор(ы), причина отказа..."
              value={formData.rejectionDetails || ''}
              onChange={(e) => updateField('rejectionDetails', e.target.value)}
            />
          </div>
        )}
      </CardContent>
    </>
  );
}

function Step4OwnerInfo({ formData, updateField }: any) {
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Раздел 3 — Информация о Владельце</CardTitle>
            <CardDescription>Данные главного владельца/руководителя</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ownerFullName">Полное Юридическое Имя *</Label>
          <Input
            id="ownerFullName"
            placeholder="Имя Фамилия"
            value={formData.ownerFullName || ''}
            onChange={(e) => updateField('ownerFullName', e.target.value)}
          />
          <p className="text-xs text-gray-500">Как в Passport/Driver License</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerTitle">Должность *</Label>
            <Input
              id="ownerTitle"
              placeholder="Владелец, CEO, Президент"
              value={formData.ownerTitle || ''}
              onChange={(e) => updateField('ownerTitle', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownershipPercent">Процент Владения *</Label>
            <Input
              id="ownershipPercent"
              type="number"
              min="0"
              max="100"
              placeholder="100"
              value={formData.ownershipPercent || ''}
              onChange={(e) => updateField('ownershipPercent', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ssn">SSN или ITIN *</Label>
            <Input
              id="ssn"
              placeholder="XXX-XX-XXXX"
              value={formData.ssn || ''}
              onChange={(e) => updateField('ssn', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerDob">Дата Рождения *</Label>
            <Input
              id="ownerDob"
              type="date"
              value={formData.ownerDob || ''}
              onChange={(e) => updateField('ownerDob', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="driverLicense">Номер Водительских Прав *</Label>
            <Input
              id="driverLicense"
              value={formData.driverLicense || ''}
              onChange={(e) => updateField('driverLicense', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dlState">Штат *</Label>
            <Input
              id="dlState"
              maxLength={2}
              placeholder="CA"
              value={formData.dlState || ''}
              onChange={(e) => updateField('dlState', e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="homeAddress">Домашний Адрес *</Label>
          <Input
            id="homeAddress"
            value={formData.homeAddress || ''}
            onChange={(e) => updateField('homeAddress', e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homeCity">Город *</Label>
            <Input
              id="homeCity"
              value={formData.homeCity || ''}
              onChange={(e) => updateField('homeCity', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeState">Штат *</Label>
            <Input
              id="homeState"
              maxLength={2}
              placeholder="CA"
              value={formData.homeState || ''}
              onChange={(e) => updateField('homeState', e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeZip">ZIP *</Label>
            <Input
              id="homeZip"
              value={formData.homeZip || ''}
              onChange={(e) => updateField('homeZip', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="personalPhone">Личный Телефон *</Label>
            <Input
              id="personalPhone"
              type="tel"
              value={formData.personalPhone || ''}
              onChange={(e) => updateField('personalPhone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmail">Личный Email *</Label>
            <Input
              id="personalEmail"
              type="email"
              value={formData.personalEmail || ''}
              onChange={(e) => updateField('personalEmail', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Личный Кредитный Рейтинг (самооценка) *</Label>
          <div className="space-y-2">
            {[
              { value: '750+', label: 'Отличный (750+)' },
              { value: '700-749', label: 'Хороший (700–749)' },
              { value: '650-699', label: 'Средний (650–699)' },
              { value: '600-649', label: 'Ниже Среднего (600-649)' },
              { value: '<600', label: 'Плохой (ниже 600)' },
              { value: 'unknown', label: 'Не знаю свой кредитный рейтинг' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="creditScore"
                  checked={formData.creditScore === option.value}
                  onChange={() => updateField('creditScore', option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </>
  );
}

function Step5Consent({ formData, updateField }: any) {
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Раздел 4 — Разрешение и Согласие</CardTitle>
            <CardDescription>Пожалуйста, внимательно прочитайте и подтвердите</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto text-sm space-y-3">
          <p className="font-semibold">Подавая эту заявку, Я/Мы разрешаем Grand Business Solutions («GBS»):</p>
          
          <div>
            <p className="font-semibold text-blue-600">1. РАЗРЕШЕНИЕ НА ПРОВЕРКУ КРЕДИТНОЙ ИСТОРИИ</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-700">
              <li>Получать и проверять личную и бизнес-кредитную историю</li>
              <li>Проводить мягкие и жёсткие кредитные проверки</li>
              <li>Проверять занятость, доход, балансы счетов</li>
              <li>Связываться с третьими сторонами для проверки информации</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-blue-600">2. ОБМЕН ИНФОРМАЦИЕЙ</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-700">
              <li>Делиться заявкой с сетью из 75+ кредитных партнёров</li>
              <li>Использовать информацию для внутреннего анализа</li>
              <li>Хранить записи в соответствии с требованиями</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-blue-600">3. СОГЛАСИЕ НА КОММУНИКАЦИЮ (TCPA)</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-700">
              <li>Телефонные звонки (включая автоматизированные)</li>
              <li>Текстовые сообщения (SMS/MMS)</li>
              <li>Электронную почту</li>
              <li>Обычную почту</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-blue-600">4. ЗАЯВЛЕНИЯ И ПОДТВЕРЖДЕНИЯ</p>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-700">
              <li>Вся информация является правдивой и точной</li>
              <li>Я являюсь уполномоченным подписантом</li>
              <li>Понимаю, что подача не гарантирует одобрения</li>
              <li>GBS является брокером, а не прямым кредитором</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeTerms || false}
              onChange={(e) => updateField('agreeTerms', e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              Я прочитал(а) и согласен(на) со всеми условиями, разрешениями и раскрытиями *
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeCommunication || false}
              onChange={(e) => updateField('agreeCommunication', e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              Я согласен(на) на контакт через телефон, SMS, email и почту *
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeCreditCheck || false}
              onChange={(e) => updateField('agreeCreditCheck', e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              Я разрешаю проверку кредитной истории *
            </span>
          </label>
        </div>

        <div className="space-y-2 pt-4">
          <Label htmlFor="signature">Электронная Подпись (Полное Имя) *</Label>
          <Input
            id="signature"
            placeholder="Введите ваше полное имя"
            value={formData.signature || ''}
            onChange={(e) => updateField('signature', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Вводя своё имя, вы подтверждаете, что это ваша электронная подпись
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatureTitle">Должность *</Label>
          <Input
            id="signatureTitle"
            placeholder="Владелец, CEO, Президент"
            value={formData.signatureTitle || ''}
            onChange={(e) => updateField('signatureTitle', e.target.value)}
          />
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-900 font-medium mb-2">
            🎉 Благодарим за Первый Шаг!
          </p>
          <p className="text-xs text-green-800">
            После отправки наша команда рассмотрит вашу заявку и подберёт для вас лучших кредиторов из нашей сети 75+ партнёров. Мы свяжемся с вами в ближайшее время!
          </p>
        </div>
      </CardContent>
    </>
  );
}

