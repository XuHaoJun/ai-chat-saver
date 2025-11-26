/**
 * 對話相關型別定義
 *
 * @module shared-types/conversation
 */

import type { Message } from './message';

/**
 * 支援的平台
 */
export type Platform = 'chatgpt' | 'claude' | 'perplexity' | 'phind' | 'deepwiki' | 'gemini';

/**
 * 平台顯示名稱對應
 */
export const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity',
  phind: 'Phind',
  deepwiki: 'deepwiki',
  gemini: 'Gemini',
};

/**
 * 對話 metadata
 */
export interface ConversationMetadata {
  /** 對話建立時間（如果平台提供） */
  createdAt?: Date;

  /** 對話更新時間（如果平台提供） */
  updatedAt?: Date;

  /** 使用的模型（如果平台提供） */
  model?: string;

  /** 其他平台特定資訊 */
  extra?: Record<string, unknown>;
}

/**
 * 對話實體 - 代表一次完整的 AI 聊天對話
 */
export interface Conversation {
  /** 對話唯一識別碼（可選，來自平台） */
  id?: string;

  /** 對話標題 */
  title: string;

  /** 來源平台 */
  platform: Platform;

  /** 原始頁面 URL */
  sourceUrl: string;

  /** 提取時間 */
  extractedAt: Date;

  /** 訊息陣列 */
  messages: Message[];

  /** 對話 metadata（可選） */
  metadata?: ConversationMetadata;
}
