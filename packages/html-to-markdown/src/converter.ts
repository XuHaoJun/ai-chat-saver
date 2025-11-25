/**
 * HTML 轉 Markdown 主要轉換器
 *
 * @module html-to-markdown/converter
 */

import { decodeHtmlEntities } from './entities';
import { convertHeadings } from './rules/headings';
import { convertCodeBlocks, convertInlineCode } from './rules/code';
import { convertLists } from './rules/lists';
import { convertTables } from './rules/tables';
import { convertLinksAndImages } from './rules/links';
import {
  convertTextFormatting,
  removeRemainingTags,
  cleanupOutput,
} from './rules/text';
import type { ConvertOptions, ConversionResult } from './types';
import { DEFAULT_OPTIONS } from './types';

/**
 * 提取圖片 URL 列表
 */
function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  return urls;
}

/**
 * 提取連結列表
 */
function extractLinks(html: string): Array<{ text: string; url: string }> {
  const links: Array<{ text: string; url: string }> = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    if (match[1] && match[2]) {
      links.push({
        url: match[1],
        text: match[2].replace(/<[^>]+>/g, '').trim(),
      });
    }
  }

  return links;
}

/**
 * 將 HTML 轉換為 Markdown
 *
 * @param html - 要轉換的 HTML 字串
 * @param options - 轉換選項
 * @returns Markdown 字串
 *
 * @example
 * ```typescript
 * const markdown = htmlToMarkdown('<h1>Hello</h1><p>World</p>');
 * // Output: "# Hello\n\nWorld\n"
 * ```
 */
export function htmlToMarkdown(html: string, options?: ConvertOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = html;

  // 移除 HTML 註解
  if (opts.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 轉換順序很重要：
  // 1. 先處理程式碼區塊（避免內容被其他規則處理）
  result = convertCodeBlocks(result, opts);

  // 2. 處理表格（結構化內容）
  result = convertTables(result, opts);

  // 3. 處理列表
  result = convertLists(result, opts);

  // 4. 處理標題
  result = convertHeadings(result, opts);

  // 5. 處理連結和圖片
  result = convertLinksAndImages(result, opts);

  // 6. 處理行內程式碼（在連結處理後）
  result = convertInlineCode(result, opts);

  // 7. 處理文字格式（粗體、斜體等）
  result = convertTextFormatting(result, opts);

  // 8. 移除剩餘的 HTML 標籤
  result = removeRemainingTags(result, opts);

  // 9. 解碼 HTML 實體
  if (opts.decodeEntities) {
    result = decodeHtmlEntities(result);
  }

  // 10. 清理輸出格式
  result = cleanupOutput(result, opts);

  return result;
}

/**
 * 將 HTML 轉換為 Markdown 並提取資源
 *
 * @param html - 要轉換的 HTML 字串
 * @param options - 轉換選項
 * @returns 轉換結果，包含 Markdown 和提取的資源
 *
 * @example
 * ```typescript
 * const result = htmlToMarkdownWithResources('<img src="image.png" alt="test">');
 * // result.markdown: "![test](image.png)"
 * // result.imageUrls: ["image.png"]
 * ```
 */
export function htmlToMarkdownWithResources(
  html: string,
  options?: ConvertOptions
): ConversionResult {
  // 在轉換前提取資源
  const imageUrls = extractImageUrls(html);
  const links = extractLinks(html);

  // 執行轉換
  const markdown = htmlToMarkdown(html, options);

  return {
    markdown,
    imageUrls,
    links,
  };
}

