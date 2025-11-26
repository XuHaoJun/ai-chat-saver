/**
 * 文字格式轉換規則
 *
 * @module html-to-markdown/rules/text
 */

import type { ConversionRule } from '../types';

/**
 * 轉換粗體 (<b>, <strong>) 為 Markdown 粗體
 */
export const convertBold: ConversionRule = (html) => {
  let result = html;

  // 處理 <strong> 標籤
  result = result.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, content) => {
    const text = content.trim();
    if (!text) return '';
    return `**${text}**`;
  });

  // 處理 <b> 標籤
  result = result.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, content) => {
    const text = content.trim();
    if (!text) return '';
    return `**${text}**`;
  });

  return result;
};

/**
 * 轉換斜體 (<i>, <em>) 為 Markdown 斜體
 */
export const convertItalic: ConversionRule = (html) => {
  let result = html;

  // 處理 <em> 標籤
  result = result.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, content) => {
    const text = content.trim();
    if (!text) return '';
    return `*${text}*`;
  });

  // 處理 <i> 標籤
  result = result.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, content) => {
    const text = content.trim();
    if (!text) return '';
    return `*${text}*`;
  });

  return result;
};

/**
 * 轉換刪除線 (<del>, <s>, <strike>) 為 Markdown 刪除線
 */
export const convertStrikethrough: ConversionRule = (html) => {
  let result = html;

  result = result.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, (_, content) => {
    const text = content.trim();
    if (!text) return '';
    return `~~${text}~~`;
  });

  result = result.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, (_, content) => {
    const text = content.trim();
    if (!text) return '';
    return `~~${text}~~`;
  });

  result = result.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, (_, content) => {
    const text = content.trim();
    if (!text) return '';
    return `~~${text}~~`;
  });

  return result;
};

/**
 * 轉換區塊引用 (<blockquote>) 為 Markdown 引用
 */
export const convertBlockquote: ConversionRule = (html) => {
  return html.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    const lines = text.split('\n').map((line: string) => `> ${line.trim()}`);
    return '\n' + lines.join('\n') + '\n\n';
  });
};

/**
 * 轉換換行 (<br>) 為 Markdown 換行
 */
export const convertLineBreaks: ConversionRule = (html) => {
  return html.replace(/<br\s*\/?>/gi, '  \n');
};

/**
 * 轉換段落 (<p>) 為 Markdown 段落
 */
export const convertParagraphs: ConversionRule = (html) => {
  return html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => {
    return `\n${content.trim()}\n\n`;
  });
};

/**
 * 轉換水平線 (<hr>) 為 Markdown 水平線
 */
export const convertHorizontalRules: ConversionRule = (html) => {
  return html.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');
};

/**
 * 移除剩餘的 HTML 標籤
 */
export const removeRemainingTags: ConversionRule = (html) => {
  // 移除 HTML 註解
  let result = html.replace(/<!--[\s\S]*?-->/g, '');

  // 移除 <div>, <span> 等容器標籤但保留內容
  result = result.replace(/<(div|span|section|article|header|footer|main|nav|aside)[^>]*>/gi, '');
  result = result.replace(/<\/(div|span|section|article|header|footer|main|nav|aside)>/gi, '\n');

  // 移除其他未處理的標籤
  result = result.replace(/<[^>]+>/g, '');

  return result;
};

/**
 * 清理輸出格式
 */
export const cleanupOutput: ConversionRule = (html) => {
  let result = html;

  // 合併多個空行為最多兩個
  result = result.replace(/\n{3,}/g, '\n\n');

  // 移除行首行尾空白
  result = result
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  // 移除開頭和結尾的空白行
  result = result.trim();

  return result;
};

/**
 * 轉換所有文字格式
 */
export const convertTextFormatting: ConversionRule = (html, options) => {
  let result = html;
  result = convertBold(result, options);
  result = convertItalic(result, options);
  result = convertStrikethrough(result, options);
  result = convertBlockquote(result, options);
  result = convertLineBreaks(result, options);
  result = convertParagraphs(result, options);
  result = convertHorizontalRules(result, options);
  return result;
};
