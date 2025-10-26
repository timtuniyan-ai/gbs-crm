// =====================================================
// NEW YORK TIMEZONE UTILITIES
// =====================================================

// Константа для часового пояса Нью-Йорка
const NY_TIMEZONE = 'America/New_York';

/**
 * Получить текущую дату в часовом поясе Нью-Йорка
 * @returns Date объект в NY времени
 */
export const getNYDate = (): Date => {
  const now = new Date();
  // Создаем дату в NY часовом поясе
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: NY_TIMEZONE }));
  return nyTime;
};

/**
 * Получить текущую дату в формате YYYY-MM-DD для NY часового пояса
 * @returns строка даты в формате '2025-09-15'
 */
export const getNYDateString = (): string => {
  const now = new Date();
  // Получаем дату в NY часовом поясе
  const nyDateParts = now.toLocaleDateString('en-CA', { timeZone: NY_TIMEZONE }); // 'en-CA' дает формат YYYY-MM-DD
  return nyDateParts;
};

/**
 * Конвертировать дату в NY часовой пояс и вернуть в формате YYYY-MM-DD
 * @param date - дата для конвертации
 * @returns строка даты в NY часовом поясе
 */
export const formatDateForNY = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const nyTime = new Date(dateObj.toLocaleString('en-US', { timeZone: NY_TIMEZONE }));
  return nyTime.toISOString().split('T')[0];
};

/**
 * Парсить строку даты как NY время и вернуть Date объект
 * @param dateString - строка даты в формате 'YYYY-MM-DD'
 * @returns Date объект в NY времени
 */
export const parseNYDate = (dateString: string): Date => {
  // Создаем дату как полдень в NY часовом поясе чтобы избежать проблем с переходом на летнее время
  const [year, month, day] = dateString.split('-').map(Number);
  const nyDate = new Date();
  nyDate.setFullYear(year, month - 1, day);
  nyDate.setHours(12, 0, 0, 0); // Устанавливаем полдень чтобы избежать проблем с DST
  
  return nyDate;
};

/**
 * Проверить является ли дата сегодняшней в NY часовом поясе
 * @param dateString - строка даты в формате 'YYYY-MM-DD'
 * @returns true если дата сегодняшняя в NY
 */
export const isDateTodayInNY = (dateString: string): boolean => {
  const todayNY = getNYDateString();
  return dateString === todayNY;
};

/**
 * Проверить является ли дата завтрашней в NY часовом поясе
 * @param dateString - строка даты в формате 'YYYY-MM-DD'
 * @returns true если дата завтрашняя в NY
 */
export const isDateTomorrowInNY = (dateString: string): boolean => {
  const nyDate = getNYDate();
  nyDate.setDate(nyDate.getDate() + 1);
  const tomorrowNY = nyDate.toISOString().split('T')[0];
  return dateString === tomorrowNY;
};

/**
 * Получить текущее время в NY в формате HH:MM
 * @returns строка времени '14:30'
 */
export const getNYTimeString = (): string => {
  const now = new Date();
  const nyTime = now.toLocaleString('en-US', { 
    timeZone: NY_TIMEZONE, 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  return nyTime;
};

/**
 * Форматировать дату для HTML date input в NY часовом поясе
 * @param date - дата для форматирования
 * @returns строка в формате 'YYYY-MM-DD' в NY часовом поясе
 */
export const formatDateForInputNY = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  // Получаем дату в NY часовом поясе в формате YYYY-MM-DD
  return dateObj.toLocaleDateString('en-CA', { timeZone: NY_TIMEZONE });
};

/**
 * Парсить дату из HTML date input как NY время
 * @param dateString - строка даты 'YYYY-MM-DD'
 * @returns Date объект интерпретированный как NY время
 */
export const parseDateFromInputNY = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  // Создаем дату в NY часовом поясе на полдень чтобы избежать проблем с DST
  const [year, month, day] = dateString.split('-').map(Number);
  const nyDate = new Date();
  
  // Устанавливаем дату в NY часовом поясе
  const tempDate = new Date(`${dateString}T12:00:00`);
  const nyTime = tempDate.toLocaleString('en-US', { timeZone: NY_TIMEZONE });
  
  return new Date(nyTime);
};

/**
 * Отладочная функция - показать разные времена для сравнения
 */
export const debugTimezones = () => {
  const now = new Date();
  console.log('🕐 Timezone Debug:');
  console.log('Local time:', now.toString());
  console.log('UTC time:', now.toISOString());
  console.log('NY time:', now.toLocaleString('en-US', { timeZone: NY_TIMEZONE }));
  console.log('NY date string:', getNYDateString());
  console.log('Local date string:', now.toISOString().split('T')[0]);
};
