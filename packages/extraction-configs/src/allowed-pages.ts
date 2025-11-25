/**
 * 允許提取的頁面 URL 模式
 *
 * @module extraction-configs/allowed-pages
 */

import type { Platform } from '@ai-chat-saver/shared-types';

/**
 * 各平台允許提取的 URL 模式
 */
export const EXTRACTION_ALLOWED_PAGES: Record<Platform, string[]> = {
  chatgpt: [
    'chatgpt.com/c/',
    'chatgpt.com/share/',
    'chat.openai.com/c/',
    'chat.openai.com/share/',
  ],
  claude: [
    'claude.ai/chat/',
    'claude.ai/project/',
  ],
  perplexity: [
    'perplexity.ai/search/',
    'perplexity.ai/page/',
  ],
  phind: [
    'phind.com/search',
    'phind.com/agent',
  ],
  deepwiki: [
    'deepwiki.com/',
  ],
  gemini: [
    'gemini.google.com/app/',
    'gemini.google.com/u/',
  ],
};

/**
 * 檢查 URL 是否為允許提取的頁面
 *
 * @param url - 要檢查的 URL
 * @returns 匹配的平台，如果不匹配則返回 null
 */
export function getMatchingPlatform(url: string): Platform | null {
  for (const [platform, patterns] of Object.entries(EXTRACTION_ALLOWED_PAGES)) {
    for (const pattern of patterns) {
      if (url.includes(pattern)) {
        return platform as Platform;
      }
    }
  }
  return null;
}

/**
 * 檢查 URL 是否為特定平台的允許頁面
 *
 * @param url - 要檢查的 URL
 * @param platform - 要檢查的平台
 * @returns 是否為允許頁面
 */
export function isAllowedPage(url: string, platform: Platform): boolean {
  const patterns = EXTRACTION_ALLOWED_PAGES[platform];
  return patterns.some((pattern) => url.includes(pattern));
}

/**
 * 取得所有支援的 URL 模式（用於 manifest.json）
 */
export function getAllAllowedPatterns(): string[] {
  const patterns: string[] = [];

  for (const platformPatterns of Object.values(EXTRACTION_ALLOWED_PAGES)) {
    for (const pattern of platformPatterns) {
      // 轉換為 match pattern 格式
      patterns.push(`*://*.${pattern}*`);
      patterns.push(`*://${pattern}*`);
    }
  }

  return [...new Set(patterns)]; // 去重
}

