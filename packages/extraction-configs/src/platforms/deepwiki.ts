/**
 * deepwiki 平台提取設定
 *
 * @module extraction-configs/platforms/deepwiki
 *
 * 基於 research.md 中的 DOM 分析結果
 */

import type { ExtractionConfig } from '../types';

/**
 * deepwiki 提取設定
 */
export const deepwikiConfig: ExtractionConfig = {
  platform: 'deepwiki',
  domainName: 'deepwiki',
  allowedUrls: ['deepwiki.com/'],
  pageTitle: {
    selector: 'title',
    fallbackSelectors: ['.text-xl', '.text-2xl'],
  },
  contentSelector: '[data-query-display="true"]',
  extractionType: 'search-sections',
  sectionConfig: {
    userQuestionSelector: '.text-xl, .text-2xl',
    aiAnswerSelector: '.prose-custom',
  },
  sourcesExtraction: {
    selectors: [
      {
        selector: 'span[role="link"].text-pacific',
        extractionType: 'list',
        scope: 'content',
      },
    ],
  },
};

