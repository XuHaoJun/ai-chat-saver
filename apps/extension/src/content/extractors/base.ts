/**
 * 基礎提取器介面
 *
 * @module extension/content/extractors/base
 */

import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent, ExtractedSection } from '@/types/extraction';

/**
 * 基礎提取器介面
 */
export interface BaseExtractor {
  /** 平台識別碼 */
  readonly platform: string;

  /**
   * 執行提取
   *
   * @param config - 平台提取設定
   * @returns 提取結果
   */
  extract(config: ExtractionConfig): ExtractedContent;
}

/**
 * 選擇器嘗試結果
 */
export interface SelectorResult {
  element: Element | null;
  usedSelector: string | null;
  usedFallback: boolean;
}

/**
 * 嘗試使用選擇器取得元素
 *
 * @param selector - 主要選擇器
 * @param fallbacks - 備選選擇器
 * @returns 元素或 null
 */
export function queryWithFallback(
  selector: string,
  fallbacks?: string[]
): Element | null {
  const result = queryWithFallbackDetailed(selector, fallbacks);
  return result.element;
}

/**
 * 嘗試使用選擇器取得元素（詳細結果）
 *
 * @param selector - 主要選擇器
 * @param fallbacks - 備選選擇器
 * @returns 詳細結果，包含使用的選擇器資訊
 */
export function queryWithFallbackDetailed(
  selector: string,
  fallbacks?: string[]
): SelectorResult {
  let element = document.querySelector(selector);

  if (element) {
    return { element, usedSelector: selector, usedFallback: false };
  }

  if (fallbacks) {
    for (const fallback of fallbacks) {
      element = document.querySelector(fallback);
      if (element) {
        return { element, usedSelector: fallback, usedFallback: true };
      }
    }
  }

  return { element: null, usedSelector: null, usedFallback: false };
}

/**
 * 嘗試使用選擇器取得所有元素
 */
export function queryAllWithFallback(
  selector: string,
  fallbacks?: string[]
): NodeListOf<Element> {
  let elements = document.querySelectorAll(selector);

  if (elements.length === 0 && fallbacks) {
    for (const fallback of fallbacks) {
      elements = document.querySelectorAll(fallback);
      if (elements.length > 0) break;
    }
  }

  return elements;
}

/**
 * 取得頁面標題
 *
 * @param config - 提取設定
 * @returns 頁面標題
 */
export function extractPageTitle(config: ExtractionConfig): string {
  const titleElement = queryWithFallback(
    config.pageTitle.selector,
    config.pageTitle.fallbackSelectors
  );

  if (titleElement) {
    return titleElement.textContent?.trim() || document.title;
  }

  return document.title;
}

/**
 * 取得元素的 HTML 內容
 *
 * @param element - 目標元素
 * @returns HTML 內容
 */
export function getElementHtml(element: Element | null): string {
  return element?.innerHTML || '';
}

/**
 * 取得元素的文字內容
 *
 * @param element - 目標元素
 * @returns 文字內容
 */
export function getElementText(element: Element | null): string {
  return element?.textContent?.trim() || '';
}

/**
 * 建立成功的提取結果
 */
export function createSuccessResult(
  title: string,
  sections: ExtractedSection[],
  html?: string
): ExtractedContent {
  return {
    success: true,
    data: {
      title,
      html: html || '',
      sections,
    },
  };
}

/**
 * 建立失敗的提取結果
 */
export function createErrorResult(error: string): ExtractedContent {
  return {
    success: false,
    error,
  };
}

