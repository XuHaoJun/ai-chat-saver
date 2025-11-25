/**
 * Gemini 提取器
 *
 * @module extension/content/extractors/gemini
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent, MessageSection } from '@/types/extraction';
import type { BaseExtractor } from './base';
import { extractPageTitle, getElementHtml, createSuccessResult, createErrorResult } from './base';

/**
 * Gemini 提取器實作
 */
export class GeminiExtractor implements BaseExtractor {
  readonly platform = 'gemini';

  extract(config: ExtractionConfig): ExtractedContent {
    try {
      const title = extractPageTitle(config);

      // Gemini 使用 .conversation-container 包裹每個對話輪次
      const conversationContainers = document.querySelectorAll(config.contentSelector);

      if (conversationContainers.length === 0) {
        return createErrorResult('找不到對話容器');
      }

      const sections: MessageSection[] = [];
      const messageConfig = config.messageConfig;

      if (!messageConfig) {
        return createErrorResult('缺少訊息提取設定');
      }

      conversationContainers.forEach((container) => {
        // 取得使用者訊息
        const userEl = container.querySelector(
          messageConfig.userSelector || '.user-query-container'
        );

        if (userEl) {
          const userContent = userEl.querySelector('.query-text');
          const content = getElementHtml(userContent || userEl);

          if (content) {
            sections.push({
              type: 'message',
              role: messageConfig.roles.user,
              content,
            });
          }
        }

        // 取得 AI 回應
        const assistantEl = container.querySelector(
          messageConfig.assistantSelector || '.model-response-text'
        );

        if (assistantEl) {
          const content = getElementHtml(assistantEl);

          if (content) {
            sections.push({
              type: 'message',
              role: messageConfig.roles.assistant,
              content,
            });
          }
        }
      });

      if (sections.length === 0) {
        return createErrorResult('未找到任何訊息');
      }

      return createSuccessResult(title, sections);
    } catch (error) {
      return createErrorResult(error instanceof Error ? error.message : '提取過程發生未知錯誤');
    }
  }
}
