/**
 * Phind 提取器
 *
 * @module extension/content/extractors/phind
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent, SearchQASection } from '@/types/extraction';
import type { Source } from '@ai-chat-saver/shared-types';
import {
  BaseExtractor,
  extractPageTitle,
  getElementHtml,
  getElementText,
  createSuccessResult,
  createErrorResult,
} from './base';

/**
 * Phind 提取器實作
 */
export class PhindExtractor implements BaseExtractor {
  readonly platform = 'phind';

  extract(config: ExtractionConfig): ExtractedContent {
    try {
      const title = extractPageTitle(config);
      const contentContainer = document.querySelector(config.contentSelector);

      if (!contentContainer) {
        return createErrorResult('找不到搜尋結果容器');
      }

      const sections: SearchQASection[] = [];
      const sectionConfig = config.sectionConfig;

      if (!sectionConfig) {
        return createErrorResult('缺少區塊提取設定');
      }

      // 取得問題和回答
      const questions = document.querySelectorAll(sectionConfig.userQuestionSelector);
      const answers = document.querySelectorAll(sectionConfig.aiAnswerSelector);

      const maxSections = Math.max(questions.length, answers.length);

      for (let i = 0; i < maxSections; i++) {
        const questionEl = questions[i];
        const answerEl = answers[i];

        // 取得模型資訊
        const modelEl = sectionConfig.aiModelSelector
          ? document.querySelector(sectionConfig.aiModelSelector)
          : null;

        // 提取來源
        const sources = this.extractSources(config, answerEl);

        sections.push({
          type: 'search-qa',
          question: questionEl ? getElementText(questionEl) : null,
          answer: answerEl ? getElementHtml(answerEl) : null,
          model: modelEl ? getElementText(modelEl) : null,
          sources,
        });
      }

      if (sections.length === 0) {
        return createErrorResult('未找到任何搜尋結果');
      }

      return createSuccessResult(title, sections, contentContainer.innerHTML);
    } catch (error) {
      return createErrorResult(
        error instanceof Error ? error.message : '提取過程發生未知錯誤'
      );
    }
  }

  private extractSources(config: ExtractionConfig, context?: Element): Source[] {
    const sources: Source[] = [];
    const sourcesConfig = config.sourcesExtraction;

    if (!sourcesConfig) return sources;

    const searchContext = context || document;

    for (const selectorConfig of sourcesConfig.selectors) {
      const sourceElements = searchContext.querySelectorAll(selectorConfig.selector);

      sourceElements.forEach((el, index) => {
        const linkEl = el.querySelector('a') || el.closest('a');
        const title = getElementText(el) || `來源 ${index + 1}`;
        const url = linkEl?.getAttribute('href') || '';

        if (url) {
          sources.push({
            title,
            url,
            index: index + 1,
          });
        }
      });
    }

    return sources;
  }
}

