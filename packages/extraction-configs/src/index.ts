/**
 * 平台提取設定套件入口
 *
 * @module @ai-chat-saver/extraction-configs
 */

// 型別定義
export type {
  SelectorConfig,
  ActionConfig,
  MessageExtractionConfig,
  SectionExtractionConfig,
  SourceSelectorConfig,
  SourcesExtractionConfig,
  ExtractionActions,
  ExtractionType,
  ExtractionConfig,
} from './types';

// 允許頁面
export {
  EXTRACTION_ALLOWED_PAGES,
  getMatchingPlatform,
  isAllowedPage,
  getAllAllowedPatterns,
} from './allowed-pages';

// 平台設定
export { chatgptConfig } from './platforms/chatgpt';
export { claudeConfig } from './platforms/claude';
export { perplexityConfig } from './platforms/perplexity';
export { phindConfig } from './platforms/phind';
export { deepwikiConfig } from './platforms/deepwiki';
export { geminiConfig } from './platforms/gemini';

import type { Platform } from '@ai-chat-saver/shared-types';
import type { ExtractionConfig } from './types';
import { chatgptConfig } from './platforms/chatgpt';
import { claudeConfig } from './platforms/claude';
import { perplexityConfig } from './platforms/perplexity';
import { phindConfig } from './platforms/phind';
import { deepwikiConfig } from './platforms/deepwiki';
import { geminiConfig } from './platforms/gemini';

/**
 * 所有平台設定的對應表
 */
export const PLATFORM_CONFIGS: Record<Platform, ExtractionConfig> = {
  chatgpt: chatgptConfig,
  claude: claudeConfig,
  perplexity: perplexityConfig,
  phind: phindConfig,
  deepwiki: deepwikiConfig,
  gemini: geminiConfig,
};

/**
 * 根據平台取得提取設定
 */
export function getConfigForPlatform(platform: Platform): ExtractionConfig {
  return PLATFORM_CONFIGS[platform];
}
