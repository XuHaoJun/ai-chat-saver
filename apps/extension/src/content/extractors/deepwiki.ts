/**
 * deepwiki 提取器
 *
 * @module extension/content/extractors/deepwiki
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent, SearchQASection } from '@/types/extraction';
import type { Source } from '@ai-chat-saver/shared-types';
import type { BaseExtractor } from './base';
import {
  extractPageTitle,
  getElementHtml,
  getElementText,
  createSuccessResult,
  createErrorResult,
} from './base';

/**
 * deepwiki 提取器實作
 */
export class DeepwikiExtractor implements BaseExtractor {
  readonly platform = 'deepwiki';

  extract(config: ExtractionConfig): ExtractedContent {
    try {
      const title = extractPageTitle(config);

      // deepwiki 使用 data-query-display="true" 標記顯示中的問答區塊
      const visibleSections = document.querySelectorAll('[data-query-display="true"]');

      if (visibleSections.length === 0) {
        // 嘗試取得所有問答區塊
        const allSections = document.querySelectorAll('[data-query-index]');
        if (allSections.length === 0) {
          return createErrorResult('找不到問答區塊');
        }
      }

      const sections: SearchQASection[] = [];
      const sectionConfig = config.sectionConfig;

      if (!sectionConfig) {
        return createErrorResult('缺少區塊提取設定');
      }

      // 遍歷所有問答區塊
      const queryBlocks = document.querySelectorAll('[data-query-index]');

      queryBlocks.forEach((block) => {
        // 取得問題
        const questionEl = block.querySelector(sectionConfig.userQuestionSelector);
        // 取得回答
        const answerEl = block.querySelector(sectionConfig.aiAnswerSelector);

        if (questionEl || answerEl) {
          // 提取來源
          const sources = this.extractSources(config, block);

          sections.push({
            type: 'search-qa',
            question: questionEl ? getElementText(questionEl) : null,
            answer: answerEl ? getElementHtml(answerEl) : null,
            sources,
          });
        }
      });

      if (sections.length === 0) {
        return createErrorResult('未找到任何問答內容');
      }

      return createSuccessResult(title, sections);
    } catch (error) {
      return createErrorResult(error instanceof Error ? error.message : '提取過程發生未知錯誤');
    }
  }

  private extractSources(config: ExtractionConfig, context: Element): Source[] {
    const sources: Source[] = [];
    const sourcesConfig = config.sourcesExtraction;

    if (!sourcesConfig) return sources;

    for (const selectorConfig of sourcesConfig.selectors) {
      const sourceElements = context.querySelectorAll(selectorConfig.selector);

      sourceElements.forEach((el, index) => {
        // deepwiki 的來源是 span[role="link"]
        const title = getElementText(el) || `來源 ${index + 1}`;
        // 嘗試從 data 屬性或相鄰元素取得 URL
        const url = el.getAttribute('data-href') || '';

        sources.push({
          title,
          url,
          index: index + 1,
        });
      });
    }

    return sources;
  }
}
