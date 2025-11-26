/**
 * 提取相關型別定義
 *
 * @module extension/types/extraction
 */

import type { Source } from '@ai-chat-saver/shared-types';

/**
 * 提取區塊類型
 */
export type ExtractedSectionType = 'message' | 'search-qa' | 'article' | 'generic';

/**
 * 訊息區塊
 */
export interface MessageSection {
  type: 'message';
  role: string;
  content: string;
  inputs?: string[];
  sources?: Source[];
}

/**
 * 搜尋問答區塊
 */
export interface SearchQASection {
  type: 'search-qa';
  question: string | null;
  answer: string | null;
  model?: string | null;
  sources?: Source[];
}

/**
 * 文章區塊
 */
export interface ArticleSection {
  type: 'article';
  content: string;
  sources?: Source[];
}

/**
 * 通用區塊
 */
export interface GenericSection {
  type: 'generic';
  html: string;
}

/**
 * 提取區塊聯合型別
 */
export type ExtractedSection = MessageSection | SearchQASection | ArticleSection | GenericSection;

/**
 * 提取資料
 */
export interface ExtractedData {
  /** 頁面標題 */
  title: string;

  /** 原始 HTML（備用） */
  html: string;

  /** 結構化區塊 */
  sections: ExtractedSection[];
}

/**
 * 提取內容結果
 */
export interface ExtractedContent {
  /** 是否成功 */
  success: boolean;

  /** 資料（成功時） */
  data?: ExtractedData;

  /** 錯誤訊息（失敗時） */
  error?: string;
}

/**
 * 提取狀態
 */
export type ExtractionStatus =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'unsupported'; message: string }
  | { status: 'extracting'; platform: string }
  | { status: 'formatting' }
  | { status: 'exporting'; destinations: string[] }
  | { status: 'complete'; results: ExportResult[] }
  | { status: 'error'; error: string };

/**
 * 匯出結果（本地定義，與 output.ts 一致）
 */
export interface ExportResult {
  success: boolean;
  destination: string;
  error?: string;
}
