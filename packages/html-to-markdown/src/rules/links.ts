/**
 * 連結與圖片轉換規則
 *
 * @module html-to-markdown/rules/links
 */

import type { ConversionRule } from '../types';

/**
 * 轉換超連結 (<a>) 為 Markdown 連結
 */
export const convertLinks: ConversionRule = (html, options) => {
  if (options?.convertLinks === false) {
    return html;
  }

  let result = html;

  // 處理帶 href 的連結
  result = result.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const linkText = text.replace(/<[^>]+>/g, '').trim();
    const url = href.trim();

    // 如果連結文字和 URL 相同，只顯示 URL
    if (linkText === url) {
      return `<${url}>`;
    }

    // 如果沒有連結文字，使用 URL
    if (!linkText) {
      return `<${url}>`;
    }

    return `[${linkText}](${url})`;
  });

  // 處理沒有 href 的連結（移除標籤，保留內容）
  result = result.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, (_, text) => {
    return text.replace(/<[^>]+>/g, '').trim();
  });

  return result;
};

/**
 * 轉換圖片 (<img>) 為 Markdown 圖片
 */
export const convertImages: ConversionRule = (html, options) => {
  if (options?.convertImages === false) {
    return html;
  }

  let result = html;

  // 處理帶 src 和 alt 的圖片
  result = result.replace(
    /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi,
    (_, src, alt) => {
      return `![${alt.trim()}](${src.trim()})`;
    }
  );

  // 處理 alt 在 src 前面的情況
  result = result.replace(
    /<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi,
    (_, alt, src) => {
      return `![${alt.trim()}](${src.trim()})`;
    }
  );

  // 處理只有 src 的圖片（沒有 alt）
  result = result.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (_, src) => {
    return `![](${src.trim()})`;
  });

  return result;
};

/**
 * 轉換所有連結和圖片
 */
export const convertLinksAndImages: ConversionRule = (html, options) => {
  let result = html;
  result = convertImages(result, options);
  result = convertLinks(result, options);
  return result;
};

