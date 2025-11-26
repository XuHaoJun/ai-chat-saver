/**
 * Gemini 平台提取設定
 *
 * @module extraction-configs/platforms/gemini
 *
 * 基於 research.md 中的 DOM 分析結果
 */

import type { ExtractionConfig } from '../types';

/**
 * Gemini 提取設定
 */
export const geminiConfig: ExtractionConfig = {
  platform: 'gemini',
  domainName: 'Gemini',
  allowedUrls: ['gemini.google.com/app/', 'gemini.google.com/u/'],
  pageTitle: {
    selector: 'title',
    fallbackSelectors: ['[data-test-id="conversation-title"]', 'h1', '[class*="title"]'],
    description: '對話標題',
  },
  contentSelector: '.conversation-container',
  extractionType: 'message-list',
  messageConfig: {
    userSelector: '.user-query-container',
    assistantSelector: '.model-response-text',
    contentSelector: '.query-text, .model-response-text, .gds-body-l',
    roles: {
      user: '使用者',
      assistant: 'Gemini',
    },
  },
};
