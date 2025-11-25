/**
 * Claude 平台提取設定
 *
 * @module extraction-configs/platforms/claude
 */

import type { ExtractionConfig } from '../types';

/**
 * Claude 提取設定
 */
export const claudeConfig: ExtractionConfig = {
  platform: 'claude',
  domainName: 'Claude',
  allowedUrls: [
    'claude.ai/chat/',
    'claude.ai/project/',
  ],
  pageTitle: {
    selector: '[data-testid="chat-title"]',
    fallbackSelectors: ['title', 'h1'],
  },
  contentSelector: '[data-testid="chat-messages"]',
  extractionType: 'message-list',
  messageConfig: {
    userSelector: '[data-testid="user-message"]',
    assistantSelector: '[data-testid="assistant-message"]',
    contentSelector: '.prose',
    roles: {
      user: '使用者',
      assistant: 'Claude',
    },
    attachmentsSelector: '[data-testid="file-attachment"]',
  },
};

