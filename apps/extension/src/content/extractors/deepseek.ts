/**
 * DeepSeek 提取器
 *
 * @module extension/content/extractors/deepseek
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent, MessageSection } from '@/types/extraction';
import type { BaseExtractor } from './base';
import { extractPageTitle, getElementHtml, createSuccessResult, createErrorResult } from './base';

/**
 * DeepSeek 提取器實作
 */
export class DeepSeekExtractor implements BaseExtractor {
  readonly platform = 'deepseek';

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
      // DeepSeek 的訊息通常都有 .ds-message 類別，或者包含 ds-message 的類別
      // 我們儘量使用特定的選擇器，但會加上安全處理
      const userSelector = messageConfig.userSelector || '.ds-message:not(:has(.ds-markdown))';
      const assistantSelector = messageConfig.assistantSelector || '.ds-message:has(.ds-markdown)';

      // 收集所有訊息元素
      let messageElements: Element[] = [];
      try {
        const elements = contentContainer.querySelectorAll(
          `${userSelector}, ${assistantSelector}, .ds-message, [class*="ds-message"]`
        );
        messageElements = Array.from(elements);
      } catch (e) {
        // 如果選擇器報錯（例如不支援 :has()），則使用基礎選擇器並過濾重複項
        const baseElements = contentContainer.querySelectorAll('.ds-message, [class*="ds-message"]');
        messageElements = Array.from(baseElements);
      }

      // 使用 Set 來去重，因為 querySelectorAll 的組合選擇器可能會傳回重複項（雖然通常不會）
      // 但我們這裡手動合併了多個來源，保險起見
      const uniqueElements = Array.from(new Set(messageElements));

      uniqueElements.forEach((element) => {
        // 判斷角色：優先使用 element 內容判斷，並安全地呼叫 matches
        let isAssistant = false;
        
        // 1. 嘗試使用 assistantSelector (可能包含 :has())
        try {
          if (assistantSelector) {
            isAssistant = element.matches(assistantSelector);
          }
        } catch (e) {
          // 忽略不支援的選擇器錯誤
        }

        // 2. 使用結構化判斷 (最可靠的備選方案)
        if (!isAssistant) {
          isAssistant = !!element.querySelector('.ds-markdown') || 
                       !!element.querySelector('[class*="markdown"]');
        }
        
        const roleName = isAssistant ? messageConfig.roles.assistant : messageConfig.roles.user;

        // 取得訊息內容容器
        let contentElement: Element | null = null;
        if (isAssistant) {
          contentElement = element.querySelector('.ds-markdown') || element.querySelector('[class*="markdown"]');
        } else {
          // 使用者訊息：嘗試尋找內容容器
          // 優先使用設定中的 contentSelector
          if (messageConfig.contentSelector) {
            contentElement = element.querySelector(messageConfig.contentSelector);
          }
          
          // 如果沒找到或找到的是整個 message，則嘗試找內容 div
          if (!contentElement || contentElement === element) {
            // 排除掉一些可能的圖標或按鈕 div，找第一個具有文字內容的 div
            const divs = Array.from(element.querySelectorAll('div'));
            contentElement = divs.find(d => d.children.length === 0 && d.textContent?.trim()) || 
                             element.querySelector('div:not([class*="icon"]):not([role="button"])') || 
                             element.firstElementChild;
          }
        }

        const content = getElementHtml(contentElement || element);

        if (content) {
          sections.push({
            type: 'message',
            role: roleName,
            content,
          });
        }
      });

      if (sections.length === 0) {
        return createErrorResult('未找到任何訊息');
      }

      // 移除標題結尾的 " - DeepSeek"
      const cleanedTitle = title.replace(/\s*-\s*DeepSeek$/i, '');

      return createSuccessResult(cleanedTitle, sections, contentContainer.innerHTML);
    } catch (error) {
      return createErrorResult(error instanceof Error ? error.message : '提取過程發生未知錯誤');
    }
  }
}

