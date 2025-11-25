/**
 * 列表轉換規則
 *
 * @module html-to-markdown/rules/lists
 */

import type { ConversionRule } from '../types';

/**
 * 處理列表項目內容
 */
function processListItemContent(content: string): string {
  return content
    .replace(/<[^>]+>/g, ' ') // 移除 HTML 標籤
    .replace(/\s+/g, ' ') // 合併空白
    .trim();
}

/**
 * 轉換無序列表 (<ul>) 為 Markdown 列表
 */
export const convertUnorderedLists: ConversionRule = (html) => {
  let result = html;

  // 處理 <ul> 列表
  result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const markdownItems = items
      .map((item: string) => {
        const itemContent = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/i, '$1');
        return `- ${processListItemContent(itemContent)}`;
      })
      .join('\n');
    return `\n${markdownItems}\n\n`;
  });

  return result;
};

/**
 * 轉換有序列表 (<ol>) 為 Markdown 列表
 */
export const convertOrderedLists: ConversionRule = (html) => {
  let result = html;

  // 處理 <ol> 列表
  result = result.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const markdownItems = items
      .map((item: string, index: number) => {
        const itemContent = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/i, '$1');
        return `${index + 1}. ${processListItemContent(itemContent)}`;
      })
      .join('\n');
    return `\n${markdownItems}\n\n`;
  });

  return result;
};

/**
 * 轉換所有列表
 */
export const convertLists: ConversionRule = (html, options) => {
  let result = html;
  result = convertUnorderedLists(result, options);
  result = convertOrderedLists(result, options);
  return result;
};

