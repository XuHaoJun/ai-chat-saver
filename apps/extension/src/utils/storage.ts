/**
 * 瀏覽器儲存 API 封裝
 *
 * @module extension/utils/storage
 */

import browser from 'webextension-polyfill';
import type { StorageSchema, Platform } from '@ai-chat-saver/shared-types';
import { DEFAULT_STORAGE } from '@ai-chat-saver/shared-types';

export type { StorageSchema };
export { DEFAULT_STORAGE };

/**
 * 取得儲存的設定
 *
 * @param keys - 要取得的鍵（可選，預設取得全部）
 * @returns 儲存的設定
 */
export async function getStorage<K extends keyof StorageSchema>(
  keys?: K[]
): Promise<Pick<StorageSchema, K>> {
  const keysToGet = keys ?? (Object.keys(DEFAULT_STORAGE) as K[]);
  const result = await browser.storage.sync.get(keysToGet);

  // 合併預設值
  const merged: Partial<StorageSchema> = { ...DEFAULT_STORAGE };
  for (const key of keysToGet) {
    if (key in result) {
      merged[key] = result[key];
    }
  }

  return merged as Pick<StorageSchema, K>;
}

/**
 * 儲存設定
 *
 * @param items - 要儲存的項目
 */
export async function setStorage(items: Partial<StorageSchema>): Promise<void> {
  await browser.storage.sync.set(items);
}

/**
 * 重設為預設值
 */
export async function resetStorage(): Promise<void> {
  await browser.storage.sync.clear();
  await browser.storage.sync.set(DEFAULT_STORAGE);
}

/**
 * 更新匯出統計
 *
 * @param platform - 使用的平台
 */
export async function updateExportStats(platform: Platform): Promise<void> {
  const current = await getStorage(['exportCount', 'lastUsedPlatform']);
  await setStorage({
    exportCount: (current.exportCount || 0) + 1,
    lastUsedPlatform: platform,
  });
}

/**
 * 監聽儲存變更
 *
 * @param callback - 變更回呼函數
 * @returns 取消監聽的函數
 */
export function onStorageChange(
  callback: (changes: {
    [K in keyof StorageSchema]?: {
      oldValue?: StorageSchema[K];
      newValue?: StorageSchema[K];
    };
  }) => void
): () => void {
  const listener = (
    changes: { [key: string]: browser.Storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'sync') {
      callback(
        changes as {
          [K in keyof StorageSchema]?: {
            oldValue?: StorageSchema[K];
            newValue?: StorageSchema[K];
          };
        }
      );
    }
  };

  browser.storage.onChanged.addListener(listener);

  return () => {
    browser.storage.onChanged.removeListener(listener);
  };
}

/**
 * 驗證 Webhook URL
 *
 * @param url - URL 字串
 * @returns 是否有效
 */
export function validateWebhookUrl(url: string): boolean {
  if (!url) return true; // 空字串是有效的（表示未設定）

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
