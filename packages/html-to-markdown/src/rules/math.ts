/**
 * Math 公式轉換規則
 *
 * @module html-to-markdown/rules/math
 */

import type { ConversionRule } from '../types';
import { decodeHtmlEntities } from '../entities';

/**
 * 轉換 KaTeX math 公式為 Markdown 格式
 *
 * Gemini 使用 KaTeX 渲染數學公式，LaTeX 原始碼儲存在 data-math 屬性中。
 * 此規則會提取 LaTeX 並轉換為 Markdown 數學格式：
 * - 行內數學: $...$
 * - 區塊數學: $$...$$
 */
/**
 * 匹配平衡的 HTML 標籤（處理嵌套）
 */
function matchBalancedTag(html: string, tagName: string, startPos: number): number {
  const openTag = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let depth = 1;
  let pos = startPos;

  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf(openTag, pos);
    const nextClose = html.indexOf(closeTag, pos);

    if (nextClose === -1) break; // 沒有找到結束標籤

    if (nextOpen !== -1 && nextOpen < nextClose) {
      // 找到嵌套的開始標籤
      depth++;
      pos = nextOpen + openTag.length;
    } else {
      // 找到結束標籤
      depth--;
      if (depth === 0) {
        return nextClose + closeTag.length;
      }
      pos = nextClose + closeTag.length;
    }
  }

  return -1; // 沒有找到匹配的結束標籤
}

export const convertMath: ConversionRule = (html) => {
  let result = html;

  // 1. 處理 KaTeX 標註 (DeepSeek 等平台使用)
  // KaTeX 通常有 <annotation encoding="application/x-tex"> 包含原始碼
  // 我們尋找最外層的 katex 容器
  const katexContainerRegex = /<(span|div)[^>]*class="[^"]*katex(?:-display)?[^"]*"[^>]*>/gi;
  const katexReplacements: Array<{ start: number; end: number; replacement: string }> = [];
  let katexMatch;

  while ((katexMatch = katexContainerRegex.exec(result)) !== null) {
    const tagName = katexMatch[1];
    const fullTag = katexMatch[0];
    if (!tagName) continue;

    const isDisplay = fullTag.includes('katex-display');
    const startPos = katexMatch.index;

    // 使用 matchBalancedTag 找到容器結束位置
    const endPos = matchBalancedTag(result, tagName, startPos + fullTag.length);

    if (endPos !== -1) {
      const containerHtml = result.slice(startPos, endPos);

      // 檢查是否包含 annotation
      const annotationMatch = containerHtml.match(
        /<annotation[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/i
      );

      if (annotationMatch && annotationMatch[1]) {
        let latex = annotationMatch[1].trim();
        latex = decodeHtmlEntities(latex);

        const replacement = isDisplay ? `\n\n$$${latex}$$\n\n` : `$${latex}$`;

        katexReplacements.push({
          start: startPos,
          end: endPos,
          replacement,
        });
      }

      // 將 exec 的 index 移到容器結束後，避免重複處理嵌套的 span.katex
      // 無論是否找到 annotation，只要是平衡的 KaTeX 容器都應該跳過，避免重複匹配內部的元素
      katexContainerRegex.lastIndex = endPos;
    } else {
      // 如果找不到匹配的結束標籤，確保 lastIndex 至少移動到目前匹配的標籤之後
      // 雖然 exec() 會自動移動，但明確設定可以避免潛在的無限迴圈風險
      katexContainerRegex.lastIndex = startPos + fullTag.length;
    }
  }

  // 從後往前替換
  for (let i = katexReplacements.length - 1; i >= 0; i--) {
    const replacement = katexReplacements[i];
    if (!replacement) continue;
    const { start, end, replacement: replacementText } = replacement;
    result = result.slice(0, start) + replacementText + result.slice(end);
  }

  // 2. 處理區塊數學 (Gemini 等平台使用)
  // 匹配包含 math-block class 和 data-math 屬性的 div
  const blockMathRegex =
    /<div[^>]*(?:class="[^"]*math-block[^"]*"[^>]*data-math="([^"]*)"|data-math="([^"]*)"[^>]*class="[^"]*math-block[^"]*")[^>]*>/gi;
  let match;
  const replacements: Array<{ start: number; end: number; replacement: string }> = [];

  while ((match = blockMathRegex.exec(result)) !== null) {
    const latex = match[1] || match[2];
    if (!latex) continue;

    const startPos = match.index;
    const endPos = matchBalancedTag(result, 'div', startPos + match[0].length);

    if (endPos !== -1) {
      const decoded = decodeHtmlEntities(latex);
      replacements.push({
        start: startPos,
        end: endPos,
        replacement: `\n\n$$${decoded}$$\n\n`,
      });

      // 跳過整個區塊，避免重複處理嵌套的元素
      blockMathRegex.lastIndex = endPos;
    } else {
      // 確保即使沒有找到結束標籤，lastIndex 也會前進
      blockMathRegex.lastIndex = startPos + match[0].length;
    }
  }

  // 從後往前替換，避免位置偏移
  for (let i = replacements.length - 1; i >= 0; i--) {
    const replacement = replacements[i];
    if (!replacement) continue;
    const { start, end, replacement: replacementText } = replacement;
    result = result.slice(0, start) + replacementText + result.slice(end);
  }

  // 處理行內數學
  // 匹配包含 math-inline class 和 data-math 屬性的 span
  const inlineMathRegex =
    /<span[^>]*(?:class="[^"]*math-inline[^"]*"[^>]*data-math="([^"]*)"|data-math="([^"]*)"[^>]*class="[^"]*math-inline[^"]*")[^>]*>/gi;
  const inlineReplacements: Array<{ start: number; end: number; replacement: string }> = [];
  match = null;

  while ((match = inlineMathRegex.exec(result)) !== null) {
    const latex = match[1] || match[2];
    if (!latex) continue;

    const startPos = match.index;
    const endPos = matchBalancedTag(result, 'span', startPos + match[0].length);

    if (endPos !== -1) {
      const decoded = decodeHtmlEntities(latex);
      inlineReplacements.push({
        start: startPos,
        end: endPos,
        replacement: `$${decoded}$`,
      });

      // 跳過整個區塊，避免重複處理嵌套的元素
      inlineMathRegex.lastIndex = endPos;
    } else {
      // 確保即使沒有找到結束標籤，lastIndex 也會前進
      inlineMathRegex.lastIndex = startPos + match[0].length;
    }
  }

  // 從後往前替換，避免位置偏移
  for (let i = inlineReplacements.length - 1; i >= 0; i--) {
    const replacement = inlineReplacements[i];
    if (!replacement) continue;
    const { start, end, replacement: replacementText } = replacement;
    result = result.slice(0, start) + replacementText + result.slice(end);
  }

  return result;
};
