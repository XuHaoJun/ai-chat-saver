/**
 * 使用者通知工具
 *
 * @module extension/utils/notifications
 */

import browser from 'webextension-polyfill';

/**
 * 通知類型
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * 通知選項
 */
export interface NotificationOptions {
  /** 通知類型 */
  type?: NotificationType;
  /** 標題 */
  title: string;
  /** 訊息內容 */
  message: string;
  /** 自動關閉時間（毫秒），0 表示不自動關閉 */
  timeout?: number;
}

/**
 * 取得圖示路徑
 */
function getIconPath(type: NotificationType): string {
  // 根據類型選擇不同圖示（目前統一使用主圖示）
  return browser.runtime.getURL('icons/icon-128.png');
}

/**
 * 建立唯一的通知 ID
 */
function createNotificationId(): string {
  return `ai-chat-saver-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * 顯示通知
 */
export async function showNotification(options: NotificationOptions): Promise<string> {
  const notificationId = createNotificationId();

  await browser.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: getIconPath(options.type || 'info'),
    title: options.title,
    message: options.message,
  });

  // 自動關閉
  if (options.timeout && options.timeout > 0) {
    setTimeout(() => {
      browser.notifications.clear(notificationId);
    }, options.timeout);
  }

  return notificationId;
}

/**
 * 顯示成功通知
 */
export async function showSuccess(title: string, message: string): Promise<string> {
  return showNotification({
    type: 'success',
    title,
    message,
    timeout: 5000,
  });
}

/**
 * 顯示錯誤通知
 */
export async function showError(title: string, message: string): Promise<string> {
  return showNotification({
    type: 'error',
    title,
    message,
    timeout: 10000, // 錯誤訊息顯示更久
  });
}

/**
 * 顯示提取錯誤通知
 */
export async function showExtractionError(platformName: string, error: string): Promise<string> {
  return showError('提取失敗', `無法從 ${platformName} 提取對話內容：${error}`);
}

/**
 * 顯示不支援頁面通知
 */
export async function showUnsupportedPageNotification(
  supportedPlatforms: string[]
): Promise<string> {
  const platformList = supportedPlatforms.join('、');
  return showNotification({
    type: 'warning',
    title: 'AI Chat Saver',
    message: `此頁面不支援匯出。\n\n支援的平台：${platformList}`,
    timeout: 8000,
  });
}

/**
 * 顯示匯出成功通知
 */
export async function showExportSuccess(filename: string): Promise<string> {
  return showSuccess('匯出成功', `已成功匯出：${filename}`);
}

/**
 * 顯示同時匯出通知
 */
export async function showConcurrentExportNotification(): Promise<string> {
  return showNotification({
    type: 'warning',
    title: '匯出進行中',
    message: '另一個匯出作業正在進行中。請等待完成後再試。',
    timeout: 5000,
  });
}

/**
 * 顯示部分提取警告
 */
export async function showPartialExtractionWarning(
  extractedCount: number,
  totalCount: number
): Promise<string> {
  return showNotification({
    type: 'warning',
    title: '部分內容已匯出',
    message: `僅成功提取 ${extractedCount}/${totalCount} 個區塊，部分內容可能遺失。`,
    timeout: 8000,
  });
}

/**
 * 關閉通知
 */
export async function clearNotification(notificationId: string): Promise<void> {
  await browser.notifications.clear(notificationId);
}

/**
 * 關閉所有通知
 */
export async function clearAllNotifications(): Promise<void> {
  const notifications = await browser.notifications.getAll();
  for (const id of Object.keys(notifications)) {
    if (id.startsWith('ai-chat-saver-')) {
      await browser.notifications.clear(id);
    }
  }
}
