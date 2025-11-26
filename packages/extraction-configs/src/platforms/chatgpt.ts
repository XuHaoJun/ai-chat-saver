/**
 * ChatGPT 平台提取設定
 *
 * @module extraction-configs/platforms/chatgpt
 */

import type { ExtractionConfig } from '../types';

/**
 * ChatGPT 提取設定
 */
export const chatgptConfig: ExtractionConfig = {
  platform: 'chatgpt',
  domainName: 'ChatGPT',
  allowedUrls: [
    'chatgpt.com/c/',
    'chatgpt.com/share/',
    'chat.openai.com/c/',
    'chat.openai.com/share/',
  ],
  pageTitle: {
    selector: 'h1',
    fallbackSelectors: [
      'title',
      '[data-testid="conversation-turn-1"] [data-message-author-role="user"]',
      '[class*="title"]',
      'nav h1',
    ],
    description: '對話標題',
  },
  contentSelector: 'main',
  extractionType: 'message-list',
  messageConfig: {
    roleSelector: '[data-message-author-role]',
    roleAttribute: 'data-message-author-role',
    contentSelector: '.markdown',
    userSelector: '[data-message-author-role="user"]',
    assistantSelector: '[data-message-author-role="assistant"]',
    roles: {
      user: '使用者',
      assistant: 'ChatGPT',
    },
    attachmentsSelector: '[data-testid="file-thumbnail"]',
  },
};
