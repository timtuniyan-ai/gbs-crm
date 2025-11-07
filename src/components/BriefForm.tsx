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

// Функция для автоматического форматирования даты MM.DD.YYYY
function formatDateInput(value: string): string {
  // Удаляем все нечисловые символы
  const numbers = value.replace(/\D/g, '');
  
  // Ограничиваем до 8 цифр
  const limited = numbers.slice(0, 8);
  
  // Форматируем с точками
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  } else {
    return `${limited.slice(0, 2)}.${limited.slice(2, 4)}.${limited.slice(4)}`;
  }
}

export function BriefForm({ brief, onComplete }: BriefFormProps) {
  const [currentStep, setCurrentStep] = useState(brief.currentStep || 0);
  const [formData, setFormData] = useState(brief.data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const progress = currentStep === 0 ? 0 : (currentStep / TOTAL_STEPS) * 100;

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
    if (currentStep > 0) {
      await handleSaveDraft();
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
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
      case 0:
        return <Step0Welcome />;
      case 1:
        return <Step1BusinessInfo formData={formData} updateField={updateField} />;
      case 2:
        return <Step3CurrentDebts formData={formData} updateField={updateField} />;
      case 3:
        return <Step4OwnerInfo formData={formData} updateField={updateField} />;
      case 4:
        return <Step2FinancingRequest formData={formData} updateField={updateField} />;
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
            className="w-48 h-48 mx-auto mb-4 object-contain"
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

        {/* Progress Bar - скрыт на шаге 0 */}
        {currentStep > 0 && (
          <Card className="mb-4 border border-blue-100 gap-0">
            <CardContent className="!pt-3 !pb-3 px-4 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex flex-col gap-0.5 justify-center">
                  <span className="text-xs font-semibold text-gray-900 leading-tight">
                    Шаг {currentStep} из {TOTAL_STEPS}
                  </span>
                  <span className="text-[11px] text-gray-600 leading-tight">
                    {getStepTitle(currentStep)}
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-600 flex items-center">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </CardContent>
          </Card>
        )}

        {/* Form Content */}
        <Card className="mb-6 shadow-xl border-2 border-gray-100">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <>
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
              </>
            )}
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

        {/* Save Draft Info - скрыт на шаге 0 */}
        {currentStep > 0 && (
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
        )}

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
    "Текущие долги и история",
    "Информация о владельце",
    "Запрос на финансирование",
    "Разрешение и согласие"
  ];
  return titles[step - 1] || "";
}

// Step Components
function Step0Welcome() {
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b-2 border-blue-200">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          ЗАЯВКА НА БИЗНЕС-ФИНАНСИРОВАНИЕ
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 pb-8 space-y-6">
        {/* Контактная информация */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <span className="text-blue-600">📧</span>
              <span className="font-medium">info@grandsolutions.org</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <span className="text-blue-600">📞</span>
              <span className="font-medium">+1 (215) 688 0020</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <span className="text-blue-600">🌐</span>
              <span className="font-medium">www.grandsolutions.org</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Приветствие */}
        <div className="space-y-4">
          <div className="px-4 py-6">
            <p className="text-lg text-gray-800 leading-relaxed font-medium text-justify">
              Благодарим вас за выбор Grand Business Solutions в качестве надёжного партнёра для получения оптимального бизнес-финансирования. Мы понимаем, что каждый бизнес уникален, и мы здесь, чтобы подобрать для вас идеальное решение из нашей сети <span className="font-semibold text-blue-600">75+ проверенных партнёров-кредиторов</span>.
            </p>
          </div>

          {/* Как заполнить */}
          <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
            <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Как заполнить эту заявку:
            </h4>
            <p className="text-gray-700 leading-relaxed text-sm text-justify">
              Этот краткий опросник займёт у вас приблизительно <span className="font-semibold">10-15 минут</span>. Пожалуйста, предоставьте точную и полную информацию, чтобы помочь нам найти для вас лучшие варианты финансирования. Вся информация <span className="font-semibold text-amber-700">строго конфиденциальна</span> и будет передана только одобренным кредитным партнёрам в рамках процесса квалификации.
            </p>
          </div>

          {/* Что дальше */}
          <div className="bg-green-50 rounded-lg p-5 border border-green-200">
            <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Что происходит дальше:
            </h4>
            <p className="text-gray-700 leading-relaxed text-sm text-justify">
              После того, как вы отправите эту заявку, наша команда рассмотрит вашу информацию в течение ближайшего времени и свяжется с вами для обсуждения вариантов финансирования. Мы проведём вас через каждый этап процесса, чтобы обеспечить получение необходимого вашему бизнесу финансирования.
            </p>
          </div>

          {/* Призыв к действию */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-center">
            <p className="text-white text-xl font-bold mb-2">
              Давайте начнём! 🚀
            </p>
            <p className="text-blue-100 text-sm">
              Нажмите кнопку "Далее" внизу страницы, чтобы начать заполнение заявки
            </p>
          </div>
        </div>
      </CardContent>
    </>
  );
}

function Step1BusinessInfo({ formData, updateField }: any) {
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <CardTitle>Раздел 1 — Информация о Бизнесе</CardTitle>
          <CardDescription>Расскажите нам о вашей компании</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="legalName">Полное Название Компании</Label>
          <Input
            id="legalName"
            placeholder="ABC Construction LLC"
            value={formData.legalName || ''}
            onChange={(e) => updateField('legalName', e.target.value)}
            className="brief-input"
          />
          <p className="text-xs text-gray-500">Включая организационно-правовую форму (LLC, Corp, etc.)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dbaName">DBA / Торговое Название</Label>
          <Input
            id="dbaName"
            placeholder="Оставьте пустым, если совпадает"
            value={formData.dbaName || ''}
            onChange={(e) => updateField('dbaName', e.target.value)}
            className="brief-input"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ein">Федеральный EIN</Label>
            <Input
              id="ein"
              placeholder="XX-XXXXXXX"
              value={formData.ein || ''}
              onChange={(e) => updateField('ein', e.target.value)}
              className="brief-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedDate">Дата Основания</Label>
            <Input
              id="foundedDate"
              type="text"
              placeholder="ММ.ДД.ГГГГ"
              value={formData.foundedDate || ''}
              onChange={(e) => updateField('foundedDate', formatDateInput(e.target.value))}
              className="brief-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Отрасль / Код NAICS</Label>
          <Input
            id="industry"
            placeholder="Строительство (236220)"
            value={formData.industry || ''}
            onChange={(e) => updateField('industry', e.target.value)}
            className="brief-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Зарегистрированный Бизнес Адрес</Label>
          <Input
            id="businessAddress"
            placeholder="Адрес регистрации бизнеса"
            value={formData.businessAddress || ''}
            onChange={(e) => updateField('businessAddress', e.target.value)}
            className="brief-input"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Город</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              className="brief-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Штат</Label>
            <Input
              id="state"
              placeholder="CA"
              maxLength={2}
              value={formData.state || ''}
              onChange={(e) => updateField('state', e.target.value.toUpperCase())}
              className="brief-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP</Label>
            <Input
              id="zip"
              placeholder="12345"
              value={formData.zip || ''}
              onChange={(e) => updateField('zip', e.target.value)}
              className="brief-input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employees">Количество Сотрудников</Label>
            <Input
              id="employees"
              type="number"
              min="1"
              value={formData.employees || ''}
              onChange={(e) => updateField('employees', e.target.value)}
              className="brief-input"
            />
            <p className="text-xs text-gray-500">Включая W-2 и 1099</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRevenue">Ежемесячная Выручка</Label>
            <Input
              id="monthlyRevenue"
              type="number"
              placeholder="$50,000"
              value={formData.monthlyRevenue || ''}
              onChange={(e) => updateField('monthlyRevenue', e.target.value)}
              className="brief-input"
            />
            <p className="text-xs text-gray-500">Среднее за 3 месяца</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearlyRevenue">Годовая Валовая Выручка</Label>
          <Input
            id="yearlyRevenue"
            type="number"
            placeholder="$600,000"
            value={formData.yearlyRevenue || ''}
            onChange={(e) => updateField('yearlyRevenue', e.target.value)}
            className="brief-input"
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
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <CardTitle>Раздел 4 — Запрос на Финансирование</CardTitle>
          <CardDescription>Расскажите о ваших потребностях в финансировании</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requestedAmount">Запрашиваемая Сумма Кредита</Label>
          <Input
            id="requestedAmount"
            type="number"
            placeholder="$100,000"
            value={formData.requestedAmount || ''}
            onChange={(e) => updateField('requestedAmount', e.target.value)}
            className="brief-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Основная Цель Кредита</Label>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              'Оборотный Капитал',
              'Покупка Оборудования/Траков/Другого Инвентаря',
              'Расширение Бизнеса',
              'Консолидация/Рефинансирование Долгов',
              'Покупка Недвижимости',
              'Кредитная Линия',
              'Заработная Плата'
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
          <Label htmlFor="purposeDetails">Детальное Описание Использования Средств</Label>
          <Textarea
            id="purposeDetails"
            rows={6}
            placeholder="Будьте конкретны: Если оборудование - укажите Марку, Модель, Год, VIN. Если товары - какие именно. Если расширение - опишите проект..."
            value={formData.purposeDetails || ''}
            onChange={(e) => updateField('purposeDetails', e.target.value)}
            className="brief-input"
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
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <CardTitle>Раздел 2 — Текущие Долги и История</CardTitle>
          <CardDescription>Информация о существующем финансировании</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
            <Label>Имеются ли у вас в настоящее время бизнес-кредиты?</Label>
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
              className="brief-input"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Были ли у вас Дефолты или Просрочки (30+ дней) за последние 3 года?</Label>
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
              className="brief-input"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Имеется ли у вас в настоящее время Открытое Банкротство?</Label>
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

        {formData.hasBankruptcy === 'yes' && (
          <div className="bg-gray-50/60 p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="space-y-2">
              <Label>Глава:</Label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bankruptcyChapter7 || false}
                    onChange={(e) => updateField('bankruptcyChapter7', e.target.checked)}
                  />
                  <span>7</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bankruptcyChapter11 || false}
                    onChange={(e) => updateField('bankruptcyChapter11', e.target.checked)}
                  />
                  <span>11</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bankruptcyChapter13 || false}
                    onChange={(e) => updateField('bankruptcyChapter13', e.target.checked)}
                  />
                  <span>13</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankruptcyFilingDate">Дата Подачи:</Label>
              <Input
                id="bankruptcyFilingDate"
                type="text"
                placeholder="ММ.ДД.ГГГГ"
                value={formData.bankruptcyFilingDate || ''}
                onChange={(e) => updateField('bankruptcyFilingDate', formatDateInput(e.target.value))}
                className="brief-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Текущий Статус:</Label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bankruptcyStatus"
                    checked={formData.bankruptcyStatus === 'active'}
                    onChange={() => updateField('bankruptcyStatus', 'active')}
                  />
                  <span>Активное</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bankruptcyStatus"
                    checked={formData.bankruptcyStatus === 'closed'}
                    onChange={() => updateField('bankruptcyStatus', 'closed')}
                  />
                  <span>Закрыто</span>
                </label>
              </div>
            </div>

            {formData.bankruptcyStatus === 'closed' && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="bankruptcyClosedDate">Дата закрытия:</Label>
                <Input
                  id="bankruptcyClosedDate"
                  type="text"
                  placeholder="ММ.ДД.ГГГГ"
                  value={formData.bankruptcyClosedDate || ''}
                  onChange={(e) => updateField('bankruptcyClosedDate', formatDateInput(e.target.value))}
                  className="brief-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bankruptcyExplanation">Объяснение:</Label>
              <Textarea
                id="bankruptcyExplanation"
                rows={3}
                placeholder="Предоставьте детали о статусе банкротства и сроках"
                value={formData.bankruptcyExplanation || ''}
                onChange={(e) => updateField('bankruptcyExplanation', e.target.value)}
                className="brief-input"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Получали ли вы отказ в финансировании за последние 6 месяцев?</Label>
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
              className="brief-input"
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
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          <CardTitle>Раздел 3 — Информация о Владельце</CardTitle>
          <CardDescription>Данные главного владельца/руководителя</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ownerFullName">Полное Имя</Label>
          <Input
            id="ownerFullName"
            placeholder="Имя Фамилия"
            value={formData.ownerFullName || ''}
            onChange={(e) => updateField('ownerFullName', e.target.value)}
            className="brief-input"
              />
          <p className="text-xs text-gray-500">Как в Passport/Driver License</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerTitle">Должность</Label>
            <Input
              id="ownerTitle"
              placeholder="Владелец, CEO, Президент"
              value={formData.ownerTitle || ''}
              onChange={(e) => updateField('ownerTitle', e.target.value)}
              className="brief-input"
                />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownershipPercent">Процент Владения</Label>
            <Input
              id="ownershipPercent"
              type="number"
              min="0"
              max="100"
              placeholder="100"
              value={formData.ownershipPercent || ''}
              onChange={(e) => updateField('ownershipPercent', e.target.value)}
              className="brief-input"
                />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ssn">SSN или ITIN</Label>
            <Input
              id="ssn"
              placeholder="XXX-XX-XXXX"
              value={formData.ssn || ''}
              onChange={(e) => updateField('ssn', e.target.value)}
              className="brief-input"
                />
          </div>

          <div className="space-y-2">
              <Label htmlFor="ownerDob">Дата Рождения</Label>
            <Input
              id="ownerDob"
              type="text"
              placeholder="ММ.ДД.ГГГГ"
              value={formData.ownerDob || ''}
              onChange={(e) => updateField('ownerDob', formatDateInput(e.target.value))}
              className="brief-input"
                />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="homeAddress">Домашний Адрес</Label>
          <Input
            id="homeAddress"
            value={formData.homeAddress || ''}
            onChange={(e) => updateField('homeAddress', e.target.value)}
            className="brief-input"
              />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homeCity">Город</Label>
            <Input
              id="homeCity"
              value={formData.homeCity || ''}
              onChange={(e) => updateField('homeCity', e.target.value)}
              className="brief-input"
                />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeState">Штат</Label>
            <Input
              id="homeState"
              maxLength={2}
              placeholder="CA"
              value={formData.homeState || ''}
              onChange={(e) => updateField('homeState', e.target.value.toUpperCase())}
              className="brief-input"
                />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeZip">ZIP</Label>
            <Input
              id="homeZip"
              value={formData.homeZip || ''}
              onChange={(e) => updateField('homeZip', e.target.value)}
              className="brief-input"
                />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="personalPhone">Телефон</Label>
            <Input
              id="personalPhone"
              type="tel"
              value={formData.personalPhone || ''}
              onChange={(e) => updateField('personalPhone', e.target.value)}
              className="brief-input"
              />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmail">Email</Label>
            <Input
              id="personalEmail"
              type="email"
              value={formData.personalEmail || ''}
              onChange={(e) => updateField('personalEmail', e.target.value)}
              className="brief-input"
                />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Личный Кредитный Рейтинг (из онлайн банкинг приложения)</Label>
          <div className="space-y-2">
            {[
              { value: '750+', label: 'Отличный (750+)' },
              { value: '720-750', label: 'Хороший (720-750)' },
              { value: '680-720', label: 'Средний (680-720)' },
              { value: '650-680', label: 'Ниже Среднего (650-680)' },
              { value: '<650', label: 'Плохой (ниже 650)' },
              { value: 'unknown', label: 'Не знаю свой кредитный рейтинг' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="creditScore"
                  checked={formData.creditScore === option.value}
                  onChange={() => updateField('creditScore', option.value)}
                  className="brief-input"
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
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <CardTitle>Раздел 5 — Разрешение и Согласие</CardTitle>
          <CardDescription>Пожалуйста, внимательно прочитайте и подтвердите</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg max-h-[500px] overflow-y-auto text-sm space-y-4 leading-relaxed">
          <p className="font-semibold text-base">Подавая эту заявку, Я/Мы (нижеподписавшиеся) настоящим разрешаем Grand Business Solutions («GBS»), её аффилированным лицам, партнёрам, представителям, кредиторам и назначенным третьим сторонам предпринимать следующие действия:</p>
          
          <div className="space-y-2">
            <p className="font-bold text-blue-700 text-base">1. РАЗРЕШЕНИЕ НА ПРОВЕРКУ КРЕДИТНОЙ ИСТОРИИ</p>
            <p className="font-medium">Я/Мы разрешаем GBS и её кредитным партнёрам:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Получать, получать и проверять мою/нашу личную и бизнес-кредитную историю, рейтинги и отчёты от агентств кредитной отчётности, включая, но не ограничиваясь: Experian, Equifax, TransUnion, Dun & Bradstreet и другие кредитные бюро</li>
              <li>Проводить мягкие кредитные проверки (которые не влияют на кредитный рейтинг) и/или жёсткие кредитные проверки (которые могут временно повлиять на кредитный рейтинг) по мере необходимости для оценки финансирования</li>
              <li>Проверять занятость, доход, балансы банковских счетов, финансовую информацию и активы</li>
              <li>Проводить проверки биографических данных и проверять любую информацию, предоставленную в этой заявке или подтверждающих документах</li>
              <li>Связываться и общаться с третьими сторонами, включая банки, кредиторов, арендодателей, работодателей, рекомендателей и другие организации для проверки информации</li>
              <li>Периодически повторно проверять кредитную информацию, если процесс рассмотрения заявки превышает 30 дней</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-blue-700 text-base">2. ОБМЕН ИНФОРМАЦИЕЙ И РАСПРОСТРАНЕНИЕ</p>
            <p className="font-medium">Я/Мы разрешаем GBS:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Делиться этой заявкой, всеми подтверждающими документами, финансовой информацией и кредитными отчётами с сетью из 75+ кредитных партнёров GBS, аффилированными лицами, источниками финансирования и поставщиками услуг исключительно для целей квалификации финансирования, размещения и обслуживания</li>
              <li>Продолжать делиться моей/нашей информацией с потенциальными кредиторами до тех пор, пока я/мы не получим одобрение финансирования или не отзовём эту заявку в письменной форме</li>
              <li>Использовать мою/нашу информацию для внутреннего анализа, повышения качества и улучшения услуг</li>
              <li>Хранить эту заявку и связанные документы в записях GBS в соответствии с применимыми требованиями к хранению записей</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-blue-700 text-base">3. СОГЛАСИЕ НА КОММУНИКАЦИЮ (СООТВЕТСТВИЕ TCPA)</p>
            <p className="font-medium">Я/Мы прямо соглашаемся на контакт со стороны GBS, её кредитных партнёров, аффилированных лиц и поставщиков услуг через:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Телефонные звонки (включая звонки с использованием автоматизированных систем набора, искусственных или предварительно записанных голосовых сообщений или автодозвонов)</li>
              <li>Текстовые сообщения (SMS/MMS)</li>
              <li>Электронную почту</li>
              <li>Обычную почту</li>
            </ul>
            <p className="mt-2">на телефонные номера, адреса электронной почты и физические адреса, указанные в этой заявке или обновлённые мной/нами в будущем.</p>
            
            <p className="font-medium mt-2"><span className="font-bold">Важно:</span> Это согласие применяется, даже если мой/наш телефонный номер(а) зарегистрирован(ы) в любом федеральном или государственном списке "Не звонить" (Do-Not-Call, DNC). Эти сообщения могут включать маркетинговую информацию, рекламные предложения, информацию об обслуживании, напоминания о платежах и другие деловые сообщения от GBS или её кредитных партнёров.</p>
            
            <p className="font-medium mt-2">Права на Отказ: Я/Мы понимаем, что:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Никакая покупка или завершённая транзакция не требуется в качестве условия этого согласия</li>
              <li>Могут применяться тарифы на сообщения и данные</li>
              <li>Я/Мы можем отозвать это согласие в любое время:
                <ul className="list-circle ml-6 mt-1">
                  <li>Отправив email: info@grandbusiness.solutions с темой "ПРЕКРАТИТЬ КОММУНИКАЦИИ"</li>
                  <li>Ответив "STOP" на любое текстовое сообщение</li>
                  <li>Позвонив в GBS напрямую для запроса удаления</li>
                  <li>Отправив письменное уведомление на бизнес-адрес GBS</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-blue-700 text-base">4. ЗАЯВЛЕНИЯ, СЕРТИФИКАЦИИ И ПОДТВЕРЖДЕНИЯ</p>
            <p className="font-medium">Я/Мы подтверждаем, заявляем и признаём, что:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Вся информация, предоставленная в этой заявке и подтверждающих документах, является правдивой, точной, полной и актуальной насколько мне/нам известно</li>
              <li>Я/Мы являемся уполномоченными подписантами с законными полномочиями подавать эту заявку от имени бизнес-структуры и всех перечисленных владельцев/директоров</li>
              <li>Я/Мы понимаю, что подача этой заявки не гарантирует одобрения, и что условия кредита, ставки, комиссии и условия будут варьироваться в зависимости от кредитора на основе кредитоспособности и критериев андеррайтинга</li>
              <li>Я/Мы понимаю, что GBS является консалтинговой фирмой и брокером, а не прямым кредитором, и не принимает кредитных решений</li>
              <li>Я/Мы признаём, что GBS может получать вознаграждение (комиссии, реферальные вознаграждения или другое вознаграждение) от кредиторов при успешном размещении финансирования, и что это не влияет на стоимость финансирования для меня/нас</li>
              <li>Предоставление ложной, вводящей в заблуждение или неполной информации может привести к отказу в заявке, аннулированию кредита и/или потенциальным юридическим действиям за мошенничество</li>
              <li>Я/Мы понимаю, что разные кредиторы могут проводить различные типы кредитных проверок (мягкие или жёсткие проверки) и что жёсткие проверки могут временно повлиять на мой/наш кредитный рейтинг</li>
              <li>Я/Мы получили и ознакомились с разделом Важные Раскрытия ниже</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-blue-700 text-base">5. ДЕЙСТВИЕ И СРОК РАЗРЕШЕНИЯ</p>
            <p className="font-medium">Это разрешение, согласие и соглашение:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Продолжает действовать после подачи этой заявки и остаётся в полной силе</li>
              <li>Действительно в течение 180 дней с даты подписи или до тех пор, пока финансирование не будет успешно получено, или я/мы официально не отзовём заявку в письменной форме, в зависимости от того, что произойдёт раньше</li>
              <li>Может быть продлено или расширено с моего/нашего письменного или электронного согласия</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-blue-700 text-base">6. ПОДТВЕРЖДЕНИЕ ЭЛЕКТРОННОЙ ПОДПИСИ</p>
            <p className="font-medium">Вводя моё/наше имя(имена) ниже и нажимая "Отправить" или предоставляя цифровую подпись, я/мы подтверждаем и соглашаемся, что:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Эта электронная подпись представляет собой мою/нашу юридическую подпись в соответствии с Законом об Электронных Подписях в Глобальной и Национальной Торговле (ESIGN Act) и применимыми законами штата</li>
              <li>Эта электронная подпись имеет такую же юридическую силу, действительность и исполнительную способность, как и рукописная подпись</li>
              <li>Я/Мы прочитали, поняли и согласны со всеми условиями, разрешениями и раскрытиями, содержащимися в этой заявке</li>
              <li>Я/Мы подаём эту заявку добровольно и по собственной воле</li>
            </ul>
          </div>

          <div className="border-t-2 border-gray-400 pt-4 mt-4">
            <p className="font-bold text-red-700 text-lg mb-3">ВАЖНЫЕ РАСКРЫТИЯ</p>
            <p className="font-medium mb-3">Пожалуйста, внимательно прочитайте следующие раскрытия перед подписанием:</p>
            
            <div className="space-y-3">
              <div>
                <p className="font-semibold">1. Отсутствие Гарантии Одобрения:</p>
                <p className="text-gray-700">Grand Business Solutions LLC (GBS) не гарантирует одобрение кредита, конкретные суммы кредита, процентные ставки, условия или другие параметры. Все решения о финансировании принимаются исключительно независимыми сторонними кредиторами на основе их индивидуальных критериев андеррайтинга, кредитных политик и оценки рисков.</p>
              </div>

              <div>
                <p className="font-semibold">2. Брокерские Отношения:</p>
                <p className="text-gray-700">GBS является независимой бизнес-консалтинговой и кредитной брокерской фирмой. GBS не является прямым кредитором и не финансирует кредиты. GBS облегчает связи между бизнесами, ищущими финансирование, и соответствующими кредитными партнёрами.</p>
              </div>

              <div>
                <p className="font-semibold">3. Переменные Ставки и Условия:</p>
                <p className="text-gray-700">Годовые Процентные Ставки (APR), факторные ставки, комиссии за оформление и условия кредита значительно варьируются в зависимости от кредитора, кредитного продукта, кредитного профиля, финансовых показателей бизнеса и рыночных условий. Ставки могут варьироваться от 6% APR до 99%+ APR в зависимости от финансового продукта и профиля риска. Вам рекомендуется тщательно изучить все условия кредита перед принятием любого предложения.</p>
              </div>

              <div>
                <p className="font-semibold">4. Вознаграждение Брокера:</p>
                <p className="text-gray-700">GBS может получать вознаграждение (включая, но не ограничиваясь комиссиями, реферальными вознаграждениями или соглашениями о распределении доходов) от кредиторов за успешное размещение кредитов. Это вознаграждение не увеличивает стоимость финансирования для вас и не влияет на условия, предлагаемые кредиторами.</p>
              </div>

              <div>
                <p className="font-semibold">5. Отсутствие Обязательств:</p>
                <p className="text-gray-700">Вы не обязаны принимать какое-либо финансовое предложение, представленное GBS или её кредитными партнёрами. У вас есть право отклонить любое предложение, искать лучшие условия и сравнивать предложения от нескольких кредиторов.</p>
              </div>

              <div>
                <p className="font-semibold">6. Влияние на Кредит:</p>
                <p className="text-gray-700">Подача этой заявки разрешает кредитные проверки. Хотя GBS и некоторые кредиторы могут первоначально проводить "мягкие проверки" (которые не влияют на кредитный рейтинг), другие кредиторы могут проводить "жёсткие проверки", которые могут временно повлиять на ваш кредитный рейтинг. Множественные жёсткие проверки в короткий период могут иметь кумулятивный эффект на ваш кредит.</p>
              </div>

              <div>
                <p className="font-semibold">7. Сроки Обработки:</p>
                <p className="text-gray-700">Время обработки и одобрения кредита варьируется в зависимости от кредитора, сложности кредитного продукта, полноты документации и требований к верификации. Типичные сроки составляют от 3 до 30 рабочих дней, хотя некоторые продукты могут финансироваться быстрее или медленнее.</p>
              </div>

              <div>
                <p className="font-semibold">8. Точность Информации:</p>
                <p className="text-gray-700">Предоставление неточной, ложной или вводящей в заблуждение информации может привести к немедленному отказу в заявке, аннулированию одобренного финансирования и потенциальным юридическим последствиям, включая обвинения в мошенничестве.</p>
              </div>

              <div>
                <p className="font-semibold">9. Лицензирование по Штатам:</p>
                <p className="text-gray-700">Кредитные партнёры могут не иметь лицензии на работу во всех штатах. Доступность финансовых продуктов варьируется в зависимости от штата и юрисдикции.</p>
              </div>

              <div>
                <p className="font-semibold">10. Сторонние Услуги:</p>
                <p className="text-gray-700">GBS может привлекать сторонних поставщиков услуг для обработки документов, услуг проверки или кредитного анализа. Ваша информация будет передаваться только по мере необходимости для содействия вашему запросу на финансирование.</p>
              </div>

              <div>
                <p className="font-semibold">11. Безопасность Данных:</p>
                <p className="text-gray-700">GBS применяет разумные меры безопасности для защиты вашей личной и финансовой информации. Однако ни один метод электронной передачи или хранения не является на 100% безопасным. Вы признаёте неотъемлемые риски электронной коммуникации.</p>
              </div>

              <div>
                <p className="font-semibold">12. Хранение Записей:</p>
                <p className="text-gray-700">GBS хранит записи заявок и связанные документы в соответствии с применимыми законами и может использовать обезличенную информацию для бизнес-аналитики и повышения качества.</p>
              </div>
            </div>
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
          <Label htmlFor="signature">Электронная Подпись (Полное Имя)</Label>
          <Input
            id="signature"
            placeholder="Введите ваше полное имя"
            value={formData.signature || ''}
            onChange={(e) => updateField('signature', e.target.value)}
            className="brief-input"
                />
          <p className="text-xs text-gray-500">
            Вводя своё имя, вы подтверждаете, что это ваша электронная подпись
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatureTitle">Должность</Label>
          <Input
            id="signatureTitle"
            placeholder="Владелец, CEO, Президент"
            value={formData.signatureTitle || ''}
            onChange={(e) => updateField('signatureTitle', e.target.value)}
            className="brief-input"
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

