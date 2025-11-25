/**
 * ChatGPT 提取器
 *
 * @module extension/content/extractors/chatgpt
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent, MessageSection } from '@/types/extraction';
import type { BaseExtractor } from './base';
import { extractPageTitle, getElementHtml, createSuccessResult, createErrorResult } from './base';

/**
 * ChatGPT 提取器實作
 */
export class ChatGPTExtractor implements BaseExtractor {
  readonly platform = 'chatgpt';

  extract(config: ExtractionConfig): ExtractedContent {
    try {
      const title = extractPageTitle(config);
      const contentContainer = document.querySelector(config.contentSelector);

      if (!contentContainer) {
        return createErrorResult('找不到對話內容容器');
      }

      const sections: MessageSection[] = [];
      const messageConfig = config.messageConfig;

      if (!messageConfig) {
        return createErrorResult('缺少訊息提取設定');
      }

      // 取得所有訊息元素
      const messageElements = contentContainer.querySelectorAll(
        messageConfig.roleSelector || '[data-message-author-role]'
      );

      messageElements.forEach((element) => {
        const roleAttr = messageConfig.roleAttribute || 'data-message-author-role';
        const role = element.getAttribute(roleAttr);

        if (!role) return;

        // 取得訊息內容
        const contentElement = messageConfig.contentSelector
          ? element.querySelector(messageConfig.contentSelector)
          : element;

        const content = getElementHtml(contentElement);

        if (content) {
          sections.push({
            type: 'message',
            role: role === 'user' ? messageConfig.roles.user : messageConfig.roles.assistant,
            content,
          });
        }
      });

      if (sections.length === 0) {
        return createErrorResult('未找到任何訊息');
      }

      return createSuccessResult(title, sections, contentContainer.innerHTML);
    } catch (error) {
      return createErrorResult(error instanceof Error ? error.message : '提取過程發生未知錯誤');
    }
  }
}
