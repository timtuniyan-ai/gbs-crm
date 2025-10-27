import { tasksApi, clientsApi } from '../../lib/api';
import { telegramNotifications } from './telegramNotifications';
import { formatDate } from './dateUtils';
import { getNYDate, getNYDateString, formatDateForInputNY } from './timezoneUtils';

interface TaskWithClient {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  clientId: string;
  clientName: string;
}

class TaskDueChecker {
  private isRunning = false;

  // Проверяем задачи с дедлайном на сегодня
  async checkTasksDueToday(): Promise<void> {
    if (!telegramNotifications.isConfigured()) {
      console.log('Telegram не настроен, проверка дедлайнов пропущена');
      return;
    }

    if (this.isRunning) {
      console.log('Проверка дедлайнов уже выполняется');
      return;
    }

    this.isRunning = true;

    try {
      // Получаем сегодняшнюю дату в NY часовом поясе в формате YYYY-MM-DD
      const todayFormatted = getNYDateString();

      console.log(`Проверяем задачи с дедлайном на ${todayFormatted} (NY время)`);

      // Получаем все задачи из Supabase (они в UTC)
      const allTasks = await tasksApi.getAll();
      console.log(`Получено ${allTasks.length} задач из базы данных`);

      // Фильтруем активные задачи с дедлайном на сегодня (NY время)
      const activeTasks = allTasks.filter(task => {
        const isNotCompleted = task.status !== 'completed';
        
        // Конвертируем dueDate в формат YYYY-MM-DD для сравнения
        let taskDueDateFormatted = '';
        if (task.dueDate) {
          const taskDate = new Date(task.dueDate);
          taskDueDateFormatted = taskDate.toLocaleDateString('en-CA', {
            timeZone: 'America/New_York'
          }); // Формат YYYY-MM-DD в NY времени
        }
        
        const isDueToday = taskDueDateFormatted === todayFormatted;
        
        // Подробная диагностика каждой задачи
        console.log(`Задача: "${task.title}"`);
        console.log(`  - dueDate из базы: "${task.dueDate}"`);
        console.log(`  - dueDate конвертированная: "${taskDueDateFormatted}"`);
        console.log(`  - сегодня NY: "${todayFormatted}"`);
        console.log(`  - статус: "${task.status}"`);
        console.log(`  - не завершена: ${isNotCompleted}`);
        console.log(`  - дедлайн сегодня: ${isDueToday}`);
        console.log(`  - подходит для уведомления: ${isNotCompleted && isDueToday}`);
        console.log('---');
        
        if (isDueToday) {
          console.log(`✅ Найдена задача с дедлайном на сегодня: "${task.title}" (${taskDueDateFormatted})`);
        }
        
        return isNotCompleted && isDueToday;
      });

      if (activeTasks.length === 0) {
        console.log('Нет задач с дедлайном на сегодня');
        return;
      }

      // Получаем всех клиентов для сопоставления имен
      const allClients = await clientsApi.getAll();
      const clientsMap = new Map(allClients.map(client => [
        client.id, 
        `${client.firstName} ${client.lastName}`
      ]));

      // Формируем список задач с именами клиентов
      const tasksWithClients: TaskWithClient[] = activeTasks
        .map(task => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate,
          status: task.status,
          clientId: task.clientId,
          clientName: clientsMap.get(task.clientId) || 'Неизвестный клиент'
        }))
        .filter(task => task.clientName !== 'Неизвестный клиент');

      console.log(`Найдено ${tasksWithClients.length} задач с дедлайном на сегодня`);

      // Отправляем уведомления для каждой задачи
      for (const task of tasksWithClients) {
        await telegramNotifications.notifyTaskDue(
          task.title,
          task.clientName,
          formatDate(task.dueDate)
        );
        
        // Небольшая пауза между уведомлениями
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`Отправлено ${tasksWithClients.length} уведомлений о дедлайнах`);

    } catch (error) {
      console.error('Ошибка при проверке дедлайнов задач:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Запускаем проверку в 9:00 AM NY времени
  startDailyCheck(): void {
    const scheduleNextCheck = () => {
      // Получаем текущее время в NY
      const nyTime = getNYDate();
      
      // Устанавливаем время на 9:00 AM сегодня в NY
      const targetTime = new Date(nyTime);
      targetTime.setHours(9, 0, 0, 0);
      
      // Если 9:00 AM уже прошло сегодня в NY, планируем на завтра
      if (nyTime >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      // Конвертируем обратно в UTC для setTimeout
      const nowUTC = new Date();
      const targetUTC = new Date(targetTime.toLocaleString('sv-SE', {timeZone: 'America/New_York'}));
      const msUntilTarget = targetUTC.getTime() - nowUTC.getTime();
      
      console.log(`Следующая проверка дедлайнов запланирована на: ${targetTime.toLocaleString('ru-RU', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })} (NY время)`);
      
      console.log(`Это через ${Math.round(msUntilTarget / 1000 / 60)} минут`);
      
      setTimeout(async () => {
        console.log('🔔 Запуск проверки дедлайнов в 9:00 AM NY');
        await this.checkTasksDueToday();
        scheduleNextCheck(); // Планируем следующую проверку
      }, msUntilTarget);
    };

    scheduleNextCheck();
    console.log('Система напоминаний о дедлайнах запущена (9:00 AM NY)');
  }

  // Остановка системы проверки (для тестирования)
  stop(): void {
    this.isRunning = false;
    console.log('Система напоминаний о дедлайнах остановлена');
  }

  // Метод для тестирования - запустить проверку прямо сейчас
  async testCheckNow(): Promise<void> {
    console.log('🧪 Тестовый запуск проверки дедлайнов');
    await this.checkTasksDueToday();
  }
}

// Экспортируем единственный экземпляр
export const taskDueChecker = new TaskDueChecker();
