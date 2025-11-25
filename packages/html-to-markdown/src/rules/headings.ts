/**
 * 標題轉換規則
 *
 * @module html-to-markdown/rules/headings
 */

import type { ConversionRule } from '../types';

/**
 * 轉換 HTML 標題 (h1-h6) 為 Markdown 標題
 */
export const convertHeadings: ConversionRule = (html) => {
  let result = html;

  // 轉換 h1-h6 標題
  for (let i = 1; i <= 6; i++) {
    const prefix = '#'.repeat(i);
    // 處理帶屬性的標題標籤
    result = result.replace(
      new RegExp(`<h${i}[^>]*>(.*?)<\\/h${i}>`, 'gis'),
      (_, content) => `\n${prefix} ${content.trim()}\n\n`
    );
  }

  return result;
};
