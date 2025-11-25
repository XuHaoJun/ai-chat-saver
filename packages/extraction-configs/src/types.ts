/**
 * 平台提取設定型別定義
 *
 * @module extraction-configs/types
 */

import type { Platform } from '@ai-chat-saver/shared-types';

/**
 * 選擇器設定
 */
export interface SelectorConfig {
  /** CSS 選擇器 */
  selector: string;

  /** 備選選擇器（依序嘗試） */
  fallbackSelectors?: string[];

  /** 選擇器描述（用於錯誤訊息） */
  description?: string;
}

/**
 * 動作設定
 */
export interface ActionConfig {
  /** 點擊選擇器 */
  selector: string;

  /** 作用範圍 */
  scope: 'content' | 'document';

  /** 等待時間（毫秒） */
  wait?: number;
}

/**
 * 訊息提取設定
 */
export interface MessageExtractionConfig {
  /** 角色選擇器 */
  roleSelector?: string;

  /** 角色屬性名稱 */
  roleAttribute?: string;

  /** 內容選擇器 */
  contentSelector?: string;

  /** 使用者訊息選擇器 */
  userSelector?: string;

  /** AI 訊息選擇器 */
  assistantSelector?: string;

  /** 角色對應表 */
  roles: {
    user: string;
    assistant: string;
  };

  /** 附件選擇器 */
  attachmentsSelector?: string;
}

/**
 * 區塊提取設定（用於 search-sections）
 */
export interface SectionExtractionConfig {
  /** 使用者問題選擇器 */
  userQuestionSelector: string;

  /** AI 回答選擇器 */
  aiAnswerSelector: string;

  /** AI 模型選擇器 */
  aiModelSelector?: string;
}

/**
 * 來源選擇器設定
 */
export interface SourceSelectorConfig {
  /** 開啟來源面板的動作 */
  open?: ActionConfig[];

  /** 關閉來源面板的動作 */
  close?: ActionConfig[];

  /** 來源元素選擇器 */
  selector: string;

  /** 提取類型 */
  extractionType: 'list' | 'tile-list';

  /** 選擇器作用範圍 */
  scope?: 'content' | 'document';
}

/**
 * 來源提取設定
 */
export interface SourcesExtractionConfig {
  /** 選擇器設定陣列 */
  selectors: SourceSelectorConfig[];

  /** 提取後動作 */
  afterAction?: string;
}

/**
 * 提取動作設定
 */
export interface ExtractionActions {
  /** 提取前動作 */
  beforeExtraction?: {
    type: 'click';
    selector: string;
  };

  /** 提取後動作 */
  afterExtraction?: {
    type: 'click' | 'click_act_close';
    selector?: string;
  };
}

/**
 * 提取類型
 */
export type ExtractionType =
  | 'message-list' // 訊息列表（ChatGPT, Claude, Gemini）
  | 'search-sections' // 搜尋區塊（Perplexity, Phind, deepwiki）
  | 'articles-sections' // 文章區塊
  | 'full-page'; // 全頁面

/**
 * 平台提取設定
 */
export interface ExtractionConfig {
  /** 平台識別碼 */
  platform: Platform;

  /** 平台顯示名稱 */
  domainName: string;

  /** 允許提取的 URL 模式 */
  allowedUrls: string[];

  /** 頁面標題選擇器 */
  pageTitle: SelectorConfig;

  /** 對話內容容器選擇器 */
  contentSelector: string;

  /** 提取類型 */
  extractionType: ExtractionType;

  /** 訊息設定（用於 message-list 類型） */
  messageConfig?: MessageExtractionConfig;

  /** 區塊設定（用於 search-sections 類型） */
  sectionConfig?: SectionExtractionConfig;

  /** 來源提取設定 */
  sourcesExtraction?: SourcesExtractionConfig;

  /** 提取前後動作 */
  actions?: ExtractionActions;
}
