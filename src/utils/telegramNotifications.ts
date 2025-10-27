interface TelegramConfig {
  botToken: string;
  chatId: string;
}

interface TaskDueNotification {
  taskTitle: string;
  clientName: string;
  dueDate: string;
}

class TelegramNotifications {
  private config: TelegramConfig | null = null;

  constructor() {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      this.config = { botToken, chatId };
    }
  }

  private async sendMessage(text: string): Promise<boolean> {
    if (!this.config) {
      console.log('Telegram не настроен, уведомление пропущено:', text);
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        console.error('Ошибка отправки в Telegram:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка отправки уведомления в Telegram:', error);
      return false;
    }
  }

  private formatTaskDueMessage(data: TaskDueNotification): string {
    const today = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return `⏰ <b>Task Due Reminder</b>

👤 <b>Client:</b> ${data.clientName}
📋 <b>Task:</b> ${data.taskTitle}
📅 <b>Due Date:</b> ${data.dueDate}

🚨 <b>This task is due today!</b>
🕘 ${today}`;
  }

  // Единственный метод для уведомлений - напоминание о дедлайне
  async notifyTaskDue(taskTitle: string, clientName: string, dueDate: string): Promise<void> {
    await this.sendMessage(this.formatTaskDueMessage({
      taskTitle,
      clientName,
      dueDate,
    }));
  }

  // Проверка настройки
  isConfigured(): boolean {
    return this.config !== null;
  }

  // Получить статус конфигурации для отладки
  getConfigStatus(): { configured: boolean; hasToken: boolean; hasChatId: boolean } {
    const hasToken = !!import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const hasChatId = !!import.meta.env.VITE_TELEGRAM_CHAT_ID;
    return {
      configured: this.config !== null,
      hasToken,
      hasChatId
    };
  }
}

// Экспортируем единственный экземпляр
export const telegramNotifications = new TelegramNotifications();
