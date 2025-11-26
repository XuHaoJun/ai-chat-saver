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
  allowedUrls: ['perplexity.ai/search/', 'perplexity.ai/page/'],
  pageTitle: {
    selector: 'h1',
    fallbackSelectors: ['title', '.query-text', '[class*="query"]'],
  },
  contentSelector: 'main',
  extractionType: 'search-sections',
  sectionConfig: {
    userQuestionSelector: '.query-text, [class*="query"], h1, [data-cy="query"]',
    aiAnswerSelector: '.answer-text, [class*="answer"], [data-cy="answer"], .prose, .markdown-content',
    aiModelSelector: '[class*="model"], [data-cy="model"]',
  },
  sourcesExtraction: {
    selectors: [
      {
        selector: '[class*="source"], [data-cy="source"], .citation',
        extractionType: 'list',
        scope: 'content',
      },
      {
        selector: '[class*="citation"], [data-cy="citation"]',
        extractionType: 'tile-list',
        scope: 'content',
      },
    ],
  },
};
