/**
 * Perplexity 提取器
 *
 * @module extension/content/extractors/perplexity
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
 * Perplexity 提取器實作
 */
export class PerplexityExtractor implements BaseExtractor {
  readonly platform = 'perplexity';

  extract(config: ExtractionConfig): ExtractedContent {
    try {
      console.log('[AI Chat Saver] Perplexity extractor starting...');

      const title = extractPageTitle(config);
      console.log('[AI Chat Saver] Page title:', title);

      const contentContainer = document.querySelector(config.contentSelector);
      console.log('[AI Chat Saver] Content container selector:', config.contentSelector);
      console.log('[AI Chat Saver] Content container found:', !!contentContainer);

      if (!contentContainer) {
        // Debug: list all possible containers
        const possibleContainers = document.querySelectorAll('[data-testid*="result"], [data-testid*="answer"], [data-testid*="search"], .search-results, .answer, main, article');
        console.log('[AI Chat Saver] Possible containers found:', possibleContainers.length);
        possibleContainers.forEach((el, i) => {
          console.log(`[AI Chat Saver] Container ${i}:`, el.tagName, el.className, el.getAttribute('data-testid'));
        });

        return createErrorResult('找不到搜尋結果容器');
      }

      const sections: SearchQASection[] = [];
      const sectionConfig = config.sectionConfig;

      if (!sectionConfig) {
        return createErrorResult('缺少區塊提取設定');
      }

      // 取得問題和回答
      console.log('[AI Chat Saver] Question selector:', sectionConfig.userQuestionSelector);
      console.log('[AI Chat Saver] Answer selector:', sectionConfig.aiAnswerSelector);

      const questions = document.querySelectorAll(sectionConfig.userQuestionSelector);
      const answers = document.querySelectorAll(sectionConfig.aiAnswerSelector);

      console.log('[AI Chat Saver] Questions found:', questions.length);
      console.log('[AI Chat Saver] Answers found:', answers.length);

      // Debug: log found elements
      if (questions.length > 0) {
        console.log('[AI Chat Saver] Question elements:');
        questions.forEach((el, i) => {
          console.log(`  [${i}]:`, el.tagName, el.className, el.textContent?.substring(0, 100));
        });
      }

      if (answers.length > 0) {
        console.log('[AI Chat Saver] Answer elements:');
        answers.forEach((el, i) => {
          console.log(`  [${i}]:`, el.tagName, el.className, el.textContent?.substring(0, 100));
        });
      }

      const maxSections = Math.max(questions.length, answers.length);

      for (let i = 0; i < maxSections; i++) {
        const questionEl = questions[i];
        const answerEl = answers[i];

        // 提取來源
        const sources = this.extractSources(config, answerEl);

        sections.push({
          type: 'search-qa',
          question: questionEl ? getElementText(questionEl) : null,
          answer: answerEl ? getElementHtml(answerEl) : null,
          sources,
        });
      }

      if (sections.length === 0) {
        return createErrorResult('未找到任何搜尋結果');
      }

      return createSuccessResult(title, sections, contentContainer.innerHTML);
    } catch (error) {
      return createErrorResult(error instanceof Error ? error.message : '提取過程發生未知錯誤');
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
