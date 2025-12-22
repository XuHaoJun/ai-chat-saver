/**
 * DeepSeek 平台提取設定
 *
 * @module extraction-configs/platforms/deepseek
 */

import type { ExtractionConfig } from '../types';

/**
 * DeepSeek 提取設定
 */
export const deepseekConfig: ExtractionConfig = {
  platform: 'deepseek',
  domainName: 'DeepSeek',
  allowedUrls: ['chat.deepseek.com/a/chat/s/'],
  pageTitle: {
    selector: 'title',
    fallbackSelectors: ['h1', '[class*="title"]'],
    description: '對話標題',
  },
  contentSelector: 'body',
  extractionType: 'message-list',
  messageConfig: {
    userSelector: '.ds-message:not(:has(.ds-markdown))',
    assistantSelector: '.ds-message:has(.ds-markdown)',
    contentSelector: '.ds-markdown, .ds-message > div:first-child',
    roles: {
      user: '使用者',
      assistant: 'DeepSeek',
    },
  },
};

