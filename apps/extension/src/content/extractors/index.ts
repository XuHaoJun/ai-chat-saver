/**
 * 提取器註冊表
 *
 * @module extension/content/extractors
 */

import type { Platform } from '@ai-chat-saver/shared-types';
import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent } from '@/types/extraction';
import type { BaseExtractor } from './base';
import { createErrorResult } from './base';

import { ChatGPTExtractor } from './chatgpt';
import { ClaudeExtractor } from './claude';
import { PerplexityExtractor } from './perplexity';
import { PhindExtractor } from './phind';
import { DeepwikiExtractor } from './deepwiki';
import { GeminiExtractor } from './gemini';

/**
 * 提取器註冊表
 */
const extractorRegistry: Record<Platform, BaseExtractor> = {
  chatgpt: new ChatGPTExtractor(),
  claude: new ClaudeExtractor(),
  perplexity: new PerplexityExtractor(),
  phind: new PhindExtractor(),
  deepwiki: new DeepwikiExtractor(),
  gemini: new GeminiExtractor(),
};

/**
 * 取得平台對應的提取器
 *
 * @param platform - 平台識別碼
 * @returns 提取器實例
 */
export function getExtractor(platform: Platform): BaseExtractor | null {
  return extractorRegistry[platform] || null;
}

/**
 * 執行提取
 *
 * @param platform - 平台識別碼
 * @param config - 提取設定
 * @returns 提取結果
 */
export function performExtraction(
  platform: Platform,
  config: ExtractionConfig
): ExtractedContent {
  const extractor = getExtractor(platform);

  if (!extractor) {
    return createErrorResult(`不支援的平台: ${platform}`);
  }

  return extractor.extract(config);
}

// 匯出所有提取器類別
export { ChatGPTExtractor } from './chatgpt';
export { ClaudeExtractor } from './claude';
export { PerplexityExtractor } from './perplexity';
export { PhindExtractor } from './phind';
export { DeepwikiExtractor } from './deepwiki';
export { GeminiExtractor } from './gemini';

// 匯出基礎工具
export type { BaseExtractor } from './base';
export {
  queryWithFallback,
  extractPageTitle,
  getElementHtml,
  getElementText,
  createSuccessResult,
  createErrorResult,
} from './base';

