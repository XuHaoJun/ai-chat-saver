/**
 * Perplexity 平台提取設定
 *
 * @module extraction-configs/platforms/perplexity
 */

import type { ExtractionConfig } from '../types';

/**
 * Perplexity 提取設定
 */
export const perplexityConfig: ExtractionConfig = {
  platform: 'perplexity',
  domainName: 'Perplexity',
  allowedUrls: [
    'perplexity.ai/search/',
    'perplexity.ai/page/',
  ],
  pageTitle: {
    selector: 'h1',
    fallbackSelectors: ['title', '[data-testid="query-text"]'],
  },
  contentSelector: '[data-testid="search-results"]',
  extractionType: 'search-sections',
  sectionConfig: {
    userQuestionSelector: '[data-testid="query-text"]',
    aiAnswerSelector: '[data-testid="answer-text"]',
    aiModelSelector: '[data-testid="model-name"]',
  },
  sourcesExtraction: {
    selectors: [
      {
        selector: '[data-testid="source-item"]',
        extractionType: 'list',
        scope: 'content',
      },
      {
        selector: '[data-testid="citation"]',
        extractionType: 'tile-list',
        scope: 'content',
      },
    ],
  },
};

