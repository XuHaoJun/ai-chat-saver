/**
 * 使用者設定型別定義
 *
 * @module extension/types/config
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';

/**
 * 使用者設定
 */
export interface UserConfig {
  /** 包含頁面標題 */
  includePageTitle: boolean;

  /** 包含來源引用 */
  includeSources: boolean;

  /** 格式化 Markdown */
  formatMarkdown: boolean;

  /** 檔名範本 */
  filenameTemplate: string;

  /** Webhook URL */
  webhookUrl: string;

  /** 輸出選項 */
  outputOptions: {
    localDownload: boolean;
    webhook: boolean;
  };
}

/**
 * 頁面資訊
 */
export interface PageInfos {
  /** Tab ID */
  id: number;

  /** 頁面 URL */
  url: string;

  /** 頁面標題 */
  title?: string;

  /** 可提取的平台名稱 */
  extractablePage: string;
}

/**
 * 提取請求參數
 */
export interface ExtractionRequest {
  /** 平台提取設定 */
  pageConfig: ExtractionConfig;

  /** 頁面資訊 */
  pageInfos: PageInfos;

  /** 使用者設定 */
  userConfig: UserConfig;
}

/**
 * 預設使用者設定
 */
export const DEFAULT_USER_CONFIG: UserConfig = {
  includePageTitle: true,
  includeSources: true,
  formatMarkdown: true,
  filenameTemplate: '%Y-%M-%D_%h-%m-%s_%W_%T',
  webhookUrl: '',
  outputOptions: {
    localDownload: true,
    webhook: false,
  },
};
