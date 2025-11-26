/**
 * Phind 平台提取設定
 *
 * @module extraction-configs/platforms/phind
 */

import type { ExtractionConfig } from '../types';

/**
 * Phind 提取設定
 */
export const phindConfig: ExtractionConfig = {
  platform: 'phind',
  domainName: 'Phind',
  allowedUrls: ['phind.com/search', 'phind.com/agent'],
  pageTitle: {
    selector: 'h1',
    fallbackSelectors: ['title', '.question-text'],
  },
  contentSelector: '.search-results',
  extractionType: 'search-sections',
  sectionConfig: {
    userQuestionSelector: '.question-text',
    aiAnswerSelector: '.answer-text',
    aiModelSelector: '.model-indicator',
  },
  sourcesExtraction: {
    selectors: [
      {
        selector: '.source-item',
        extractionType: 'list',
        scope: 'content',
      },
    ],
  },
};
