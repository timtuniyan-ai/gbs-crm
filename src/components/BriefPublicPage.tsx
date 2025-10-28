import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BriefForm } from "./BriefForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Lock, CheckCircle2 } from "lucide-react";
import { Brief } from "../types";
import { briefsApi } from "../../lib/api";

export function BriefPublicPage() {
  const { token } = useParams<{ token: string }>();
  const [accessCode, setAccessCode] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !accessCode) return;

    setIsVerifying(true);
    setError("");

    try {
      const isValid = await briefsApi.verifyAccess(token, accessCode);
      if (isValid) {
        const briefData = await briefsApi.getByToken(token);
        if (briefData) {
          if (briefData.status === 'completed') {
            setIsCompleted(true);
          } else {
            setBrief(briefData);
          }
        } else {
          setError("Бриф не найден");
        }
      } else {
        setError("Неверный PIN-код. Пожалуйста, попробуйте снова.");
      }
    } catch (err) {
      console.error('Error verifying access:', err);
      setError("Произошла ошибка. Пожалуйста, попробуйте позже.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setBrief(null);
  };

  // If brief is loaded, show the form
  if (brief) {
    return <BriefForm brief={brief} onComplete={handleComplete} />;
  }

  // If completed, show thank you message
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center px-4 pt-8 pb-16">
        <Card className="w-full max-w-2xl shadow-2xl border-2 border-green-200">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 pb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo.svg" 
                alt="Grand Business Solutions Logo" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Спасибо за Заполнение Брифа!
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Ваша заявка успешно отправлена
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <p className="text-gray-800 mb-4 font-medium">
                Поздравляем с важным шагом на пути к развитию вашего бизнеса!
              </p>
              <p className="text-gray-700 text-sm mb-4">
                Ваша заполненная заявка - это начало увлекательного пути к получению финансирования, необходимого для достижения ваших целей.
              </p>
              
              <div className="space-y-2 mt-4">
                <p className="text-sm text-gray-800 font-semibold">Что происходит дальше?</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Наша команда экспертов рассмотрит вашу заявку в течение ближайшего времени</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Мы подберём для вас лучших кредиторов из нашей сети 75+ партнёров</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Вы получите персонализированные варианты финансирования под ваши потребности</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Мы проведём вас через каждый этап до поступления средств на ваш счёт</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 font-medium mb-2">
                💡 Помните: Одно решение меняет всё
              </p>
              <p className="text-xs text-blue-800">
                Ваш успех - наша миссия, и мы стремимся найти для вас оптимальное финансовое решение, которое поможет вашему бизнесу процветать.
              </p>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Есть вопросы? Свяжитесь с нами:</p>
              <div className="flex flex-col items-center gap-1 text-sm text-gray-700">
                <p>📧 info@grandsolutions.org</p>
                <p>📞 +1 (215) 688 0020</p>
                <p className="text-xs text-gray-500 mt-2">🌐 www.grandsolutions.org</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-lg font-semibold text-gray-800">
                Мы рады сотрудничеству с вами на этом пути! 🚀
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show PIN entry form
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full shadow-lg border border-gray-200 bg-white">
        <CardHeader className="text-center border-b border-gray-100 pb-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.svg" 
              alt="Grand Business Solutions Logo" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center';
                fallback.innerHTML = '<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>';
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            GRAND BUSINESS SOLUTIONS
          </CardTitle>
          <CardDescription className="text-sm text-blue-600 font-medium">
            One Decision Changes Everything
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-4">
              <Lock className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Введите PIN-код
            </h3>
            <p className="text-sm text-gray-500">
              Для доступа к брифу введите PIN-код, который вы получили
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-sm font-medium text-gray-700">PIN-код</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Введите PIN-код"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center text-xl tracking-widest font-mono h-12 border-gray-300"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 text-center font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isVerifying || !accessCode}
            >
              {isVerifying ? "Проверка..." : "Войти"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>info@grandsolutions.org</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>+1 (215) 688 0020</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
