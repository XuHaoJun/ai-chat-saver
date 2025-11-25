/**
 * Claude 提取器
 *
 * @module extension/content/extractors/claude
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent, MessageSection } from '@/types/extraction';
import {
  BaseExtractor,
  extractPageTitle,
  getElementHtml,
  createSuccessResult,
  createErrorResult,
} from './base';

/**
 * Claude 提取器實作
 */
export class ClaudeExtractor implements BaseExtractor {
  readonly platform = 'claude';

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

      // Claude 使用不同的選擇器區分使用者和 AI 訊息
      const userMessages = contentContainer.querySelectorAll(
        messageConfig.userSelector || '[data-testid="user-message"]'
      );
      const assistantMessages = contentContainer.querySelectorAll(
        messageConfig.assistantSelector || '[data-testid="assistant-message"]'
      );

      // 收集所有訊息並按 DOM 順序排列
      const allMessages: Array<{ element: Element; role: 'user' | 'assistant' }> = [];

      userMessages.forEach((el) => allMessages.push({ element: el, role: 'user' }));
      assistantMessages.forEach((el) => allMessages.push({ element: el, role: 'assistant' }));

      // 按 DOM 順序排序
      allMessages.sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });

      allMessages.forEach(({ element, role }) => {
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
      return createErrorResult(
        error instanceof Error ? error.message : '提取過程發生未知錯誤'
      );
    }
  }
}

