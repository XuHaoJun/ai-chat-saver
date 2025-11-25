/**
 * 儲存契約
 *
 * 定義 chrome.storage.sync 的資料結構
 *
 * @module contracts/storage
 */

// ============================================================================
// 儲存結構
// ============================================================================

/**
 * 完整儲存結構
 */
export interface StorageSchema {
  // --- 檔名設定 ---

  /**
   * 檔名範本
   *
   * 支援的佔位符：
   * - %Y: 年（四位數）
   * - %M: 月（兩位數）
   * - %D: 日（兩位數）
   * - %h: 時（兩位數，24 小時制）
   * - %m: 分（兩位數）
   * - %s: 秒（兩位數）
   * - %t: Unix 時間戳
   * - %W: 平台名稱
   * - %H: 主機名稱
   * - %T: 對話標題（清理後）
   *
   * @default '%Y-%M-%D_%h-%m-%s_%W_%T'
   * @example '2025-01-27_14-30-00_ChatGPT_我的對話'
   */
  filenameTemplate: string;

  // --- 輸出設定 ---

  /**
   * Webhook URL（可選）
   *
   * 如果 outputOptions.webhook 為 true，
   * 則匯出時會 POST 到此 URL
   *
   * @default ''
   */
  webhookUrl: string;

  /**
   * 輸出選項
   */
  outputOptions: OutputOptions;

  // --- 內容設定 ---

  /**
   * 是否包含 metadata 標頭
   *
   * 包含：平台名稱、URL、匯出時間等
   *
   * @default true
   */
  includeMetadata: boolean;

  /**
   * 是否包含來源引用
   *
   * 適用於 Perplexity、Phind 等有搜尋結果的平台
   *
   * @default true
   */
  includeSources: boolean;

  /**
   * 是否下載媒體檔案
   *
   * 如果為 true，會下載對話中的圖片等媒體，
   * 並產生 ZIP 檔案
   *
   * @default true
   */
  downloadMedia: boolean;

  // --- 統計資料（唯讀） ---

  /**
   * 最後使用的平台
   *
   * @readonly
   */
  lastUsedPlatform?: Platform;

  /**
   * 匯出次數統計
   *
   * @readonly
   */
  exportCount?: number;
}

/**
 * 輸出選項
 */
export interface OutputOptions {
  /**
   * 啟用本地下載
   *
   * @default true
   */
  localDownload: boolean;

  /**
   * 啟用 Webhook
   *
   * 需要設定 webhookUrl
   *
   * @default false
   */
  webhook: boolean;
}

/**
 * 支援的平台
 */
export type Platform = 'chatgpt' | 'claude' | 'perplexity' | 'phind' | 'deepwiki' | 'gemini';

// ============================================================================
// 預設值
// ============================================================================

/**
 * 儲存預設值
 */
export const DEFAULT_STORAGE: StorageSchema = {
  filenameTemplate: '%Y-%M-%D_%h-%m-%s_%W_%T',
  webhookUrl: '',
  outputOptions: {
    localDownload: true,
    webhook: false,
  },
  includeMetadata: true,
  includeSources: true,
  downloadMedia: true,
};

// ============================================================================
// 儲存 API 封裝
// ============================================================================

/**
 * 取得儲存的設定
 *
 * @param keys - 要取得的鍵（可選，預設取得全部）
 * @returns 儲存的設定
 *
 * @example
 * ```typescript
 * const config = await getStorage(['filenameTemplate', 'outputOptions']);
 * console.log(config.filenameTemplate);
 * ```
 */
export async function getStorage<K extends keyof StorageSchema>(
  keys?: K[]
): Promise<Pick<StorageSchema, K>> {
  const keysToGet = keys ?? Object.keys(DEFAULT_STORAGE);
  const result = await chrome.storage.sync.get(keysToGet);

  // 合併預設值
  return {
    ...DEFAULT_STORAGE,
    ...result,
  } as Pick<StorageSchema, K>;
}

/**
 * 儲存設定
 *
 * @param items - 要儲存的項目
 *
 * @example
 * ```typescript
 * await setStorage({
 *   filenameTemplate: '%Y-%M-%D_%T',
 *   outputOptions: { localDownload: true, webhook: false },
 * });
 * ```
 */
export async function setStorage(items: Partial<StorageSchema>): Promise<void> {
  await chrome.storage.sync.set(items);
}

/**
 * 重設為預設值
 *
 * @example
 * ```typescript
 * await resetStorage();
 * ```
 */
export async function resetStorage(): Promise<void> {
  await chrome.storage.sync.clear();
  await chrome.storage.sync.set(DEFAULT_STORAGE);
}

/**
 * 監聽儲存變更
 *
 * @param callback - 變更回呼函數
 * @returns 取消監聽的函數
 *
 * @example
 * ```typescript
 * const unsubscribe = onStorageChange((changes) => {
 *   if (changes.filenameTemplate) {
 *     console.log('檔名範本已變更:', changes.filenameTemplate.newValue);
 *   }
 * });
 *
 * // 取消監聽
 * unsubscribe();
 * ```
 */
export function onStorageChange(
  callback: (changes: {
    [K in keyof StorageSchema]?: { oldValue?: StorageSchema[K]; newValue?: StorageSchema[K] };
  }) => void
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'sync') {
      callback(changes as Parameters<typeof callback>[0]);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

// ============================================================================
// 驗證
// ============================================================================

/**
 * 驗證檔名範本
 *
 * @param template - 檔名範本
 * @returns 是否有效
 */
export function validateFilenameTemplate(template: string): boolean {
  if (!template || template.length === 0) return false;
  if (template.length > 200) return false;

  // 移除所有佔位符後，檢查是否還有內容或佔位符
  const placeholders = ['%Y', '%M', '%D', '%h', '%m', '%s', '%t', '%W', '%H', '%T'];
  let remaining = template;

  for (const p of placeholders) {
    remaining = remaining.replace(new RegExp(p, 'g'), '');
  }

  // 至少要有一個佔位符或一些固定文字
  return template.length !== remaining.length || remaining.trim().length > 0;
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

/**
 * 驗證輸出選項
 *
 * @param options - 輸出選項
 * @returns 是否有效
 */
export function validateOutputOptions(options: OutputOptions): boolean {
  // 至少要啟用一個輸出目的地
  return options.localDownload || options.webhook;
}

/**
 * 驗證完整設定
 *
 * @param config - 儲存設定
 * @returns 驗證結果
 */
export function validateStorageConfig(config: Partial<StorageSchema>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.filenameTemplate !== undefined) {
    if (!validateFilenameTemplate(config.filenameTemplate)) {
      errors.push('檔名範本無效');
    }
  }

  if (config.webhookUrl !== undefined) {
    if (!validateWebhookUrl(config.webhookUrl)) {
      errors.push('Webhook URL 格式無效');
    }
  }

  if (config.outputOptions !== undefined) {
    if (!validateOutputOptions(config.outputOptions)) {
      errors.push('至少需要啟用一個輸出目的地');
    }

    // 如果啟用 webhook 但沒有設定 URL
    if (config.outputOptions.webhook && !config.webhookUrl) {
      errors.push('啟用 Webhook 時需要設定 Webhook URL');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
