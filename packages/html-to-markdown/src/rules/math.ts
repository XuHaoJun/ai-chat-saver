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

  // 處理區塊數學（先處理，因為更特定）
  // 匹配包含 math-block class 和 data-math 屬性的 div
  const blockMathRegex = /<div[^>]*(?:class="[^"]*math-block[^"]*"[^>]*data-math="([^"]*)"|data-math="([^"]*)"[^>]*class="[^"]*math-block[^"]*")[^>]*>/gi;
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
  const inlineMathRegex = /<span[^>]*(?:class="[^"]*math-inline[^"]*"[^>]*data-math="([^"]*)"|data-math="([^"]*)"[^>]*class="[^"]*math-inline[^"]*")[^>]*>/gi;
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

