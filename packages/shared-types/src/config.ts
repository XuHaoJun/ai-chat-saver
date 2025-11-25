/**
 * 設定相關型別定義
 *
 * @module shared-types/config
 */

import type { Platform } from './conversation';

/**
 * 輸出選項
 */
export interface OutputOptions {
  /** 啟用本地下載 */
  localDownload: boolean;

  /** 啟用 Webhook */
  webhook: boolean;
}

/**
 * 內容選項
 */
export interface ContentOptions {
  /** 包含 metadata 標頭 */
  includeMetadata: boolean;

  /** 包含來源引用 */
  includeSources: boolean;

  /** 包含附件資訊 */
  includeAttachments: boolean;

  /** 下載媒體檔案 */
  downloadMedia: boolean;
}

/**
 * 匯出設定 - 使用者偏好設定
 */
export interface ExportConfig {
  /** 檔名範本 */
  filenameTemplate: string;

  /** Webhook URL（可選） */
  webhookUrl: string;

  /** 輸出選項 */
  outputOptions: OutputOptions;

  /** 內容選項 */
  contentOptions: ContentOptions;
}

/**
 * 儲存結構（對應 chrome.storage.sync）
 */
export interface StorageSchema {
  /** 檔名範本 */
  filenameTemplate: string;

  /** Webhook URL */
  webhookUrl: string;

  /** 輸出選項 */
  outputOptions: OutputOptions;

  /** 是否包含 metadata 標頭 */
  includeMetadata: boolean;

  /** 是否包含來源引用 */
  includeSources: boolean;

  /** 是否下載媒體檔案 */
  downloadMedia: boolean;

  /** 最後使用的平台 */
  lastUsedPlatform?: Platform;

  /** 匯出次數統計 */
  exportCount?: number;
}

/**
 * 檔名範本佔位符
 */
export type FilenameTemplatePlaceholder =
  | '%Y' // 年（四位數）
  | '%M' // 月（兩位數）
  | '%D' // 日（兩位數）
  | '%h' // 時（兩位數，24 小時制）
  | '%m' // 分（兩位數）
  | '%s' // 秒（兩位數）
  | '%t' // Unix 時間戳
  | '%W' // 平台名稱
  | '%H' // 主機名稱
  | '%T'; // 對話標題（清理後）

/**
 * 預設儲存值
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
