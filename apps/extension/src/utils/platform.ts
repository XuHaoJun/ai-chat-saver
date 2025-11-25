/**
 * 平台偵測工具
 *
 * @module extension/utils/platform
 */

import type { Platform } from '@ai-chat-saver/shared-types';
import { getMatchingPlatform, getConfigForPlatform } from '@ai-chat-saver/extraction-configs';
import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';

/**
 * 支援的平台清單
 */
export const SUPPORTED_PLATFORMS: Platform[] = [
  'chatgpt',
  'claude',
  'perplexity',
  'phind',
  'deepwiki',
  'gemini',
];

/**
 * 平台偵測結果
 */
export interface PlatformDetectionResult {
  /** 是否為支援的平台 */
  supported: boolean;

  /** 平台識別碼 */
  platform: Platform | null;

  /** 平台設定 */
  config: ExtractionConfig | null;
}

/**
 * 從 URL 偵測平台
 *
 * @param url - 要偵測的 URL
 * @returns 平台偵測結果
 */
export function detectPlatform(url: string): PlatformDetectionResult {
  const platform = getMatchingPlatform(url);

  if (!platform) {
    return {
      supported: false,
      platform: null,
      config: null,
    };
  }

  const config = getConfigForPlatform(platform);

  return {
    supported: true,
    platform,
    config,
  };
}

/**
 * 取得平台顯示名稱
 *
 * @param platform - 平台識別碼
 * @returns 平台顯示名稱
 */
export function getPlatformDisplayName(platform: Platform): string {
  const displayNames: Record<Platform, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    perplexity: 'Perplexity',
    phind: 'Phind',
    deepwiki: 'deepwiki',
    gemini: 'Gemini',
  };

  return displayNames[platform] || platform;
}

/**
 * 取得所有支援平台的顯示名稱清單
 */
export function getSupportedPlatformNames(): string[] {
  return SUPPORTED_PLATFORMS.map(getPlatformDisplayName);
}

