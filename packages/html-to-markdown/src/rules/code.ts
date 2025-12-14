/**
 * 程式碼轉換規則
 *
 * @module html-to-markdown/rules/code
 */

import type { ConversionRule } from '../types';

/**
 * 從 class 屬性提取程式語言
 */
function extractLanguage(classAttr: string): string {
  // 嘗試匹配常見的語言類別格式
  const patterns = [
    /language-(\w+)/i,
    /lang-(\w+)/i,
    /hljs-(\w+)/i,
    /\b(typescript|javascript|python|java|cpp|c|csharp|ruby|go|rust|php|html|css|json|yaml|xml|sql|bash|shell|markdown)\b/i,
  ];

  for (const pattern of patterns) {
    const match = classAttr.match(pattern);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
  }

  return '';
}

/**
 * 從 hljs 語法高亮類別推斷程式語言
 */
function inferLanguageFromHljs(content: string): string {
  // 提取所有 hljs 類別
  const hljsClasses = content.match(/class=["']([^"']*hljs[^"']*)["']/gi) || [];
  const allClasses = hljsClasses.join(' ');

  // Python 特徵：hljs-keyword, hljs-def, hljs-function, hljs-string, async, def, await
  if (
    allClasses.includes('hljs-keyword') &&
    (allClasses.includes('hljs-def') ||
      content.includes('<span class="hljs-keyword">def</span>') ||
      content.includes('<span class="hljs-keyword">async</span>') ||
      content.includes('<span class="hljs-keyword">await</span>') ||
      content.includes('def ') ||
      content.includes('async def'))
  ) {
    return 'python';
  }

  // JavaScript/TypeScript 特徵：hljs-keyword, function, const, let, var, =>
  if (
    allClasses.includes('hljs-keyword') &&
    (content.includes('<span class="hljs-keyword">function</span>') ||
      content.includes('<span class="hljs-keyword">const</span>') ||
      content.includes('<span class="hljs-keyword">let</span>') ||
      content.includes('<span class="hljs-keyword">var</span>') ||
      content.includes('function ') ||
      content.includes('const ') ||
      content.includes('=>'))
  ) {
    // TypeScript 特徵：interface, type, import type
    if (
      content.includes('<span class="hljs-keyword">interface</span>') ||
      content.includes('<span class="hljs-keyword">type</span>') ||
      content.includes('interface ') ||
      content.includes(': string') ||
      content.includes(': number')
    ) {
      return 'typescript';
    }
    return 'javascript';
  }

  // HTML 特徵：hljs-tag, hljs-name, <, >
  if (
    allClasses.includes('hljs-tag') ||
    allClasses.includes('hljs-name') ||
    content.includes('<span class="hljs-tag">') ||
    content.includes('<span class="hljs-name">')
  ) {
    return 'html';
  }

  // CSS 特徵：hljs-selector, hljs-property, {, }
  if (
    allClasses.includes('hljs-selector') ||
    allClasses.includes('hljs-property') ||
    (content.includes('{') && content.includes('}') && content.includes(':'))
  ) {
    return 'css';
  }

  // JSON 特徵：{", "}, [, ]
  if (
    content.includes('{') &&
    content.includes('}') &&
    (content.includes('"') || content.includes("'")) &&
    !allClasses.includes('hljs-tag')
  ) {
    return 'json';
  }

  // SQL 特徵：SELECT, FROM, WHERE, INSERT, UPDATE
  if (
    content.match(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/i)
  ) {
    return 'sql';
  }

  // Bash/Shell 特徵：$, #!/bin/bash, #!/bin/sh
  if (
    content.includes('#!/bin/bash') ||
    content.includes('#!/bin/sh') ||
    content.includes('#!/usr/bin/env bash') ||
    (content.includes('$') && content.includes('echo'))
  ) {
    return 'bash';
  }

  return '';
}

/**
 * 從程式碼區塊前的文字提取語言標籤
 */
function extractLanguageFromPrecedingText(
  html: string,
  codeBlockIndex: number
): string {
  // 往前查找最多 200 個字元，尋找語言標籤
  const start = Math.max(0, codeBlockIndex - 200);
  const precedingText = html.substring(start, codeBlockIndex);

  // 移除 HTML 標籤，只保留文字
  const textOnly = precedingText.replace(/<[^>]+>/g, ' ');

  // 常見語言名稱模式（必須是獨立單詞）
  const languagePatterns = [
    /\b(python|py)\b/i,
    /\b(javascript|js)\b/i,
    /\b(typescript|ts)\b/i,
    /\b(html)\b/i,
    /\b(css)\b/i,
    /\b(json)\b/i,
    /\b(sql)\b/i,
    /\b(bash|shell|sh)\b/i,
    /\b(java)\b/i,
    /\b(cpp|c\+\+)\b/i,
    /\b(csharp|c#)\b/i,
    /\b(ruby|rb)\b/i,
    /\b(go|golang)\b/i,
    /\b(rust|rs)\b/i,
    /\b(php)\b/i,
    /\b(yaml|yml)\b/i,
    /\b(xml)\b/i,
    /\b(markdown|md)\b/i,
  ];

  // 從後往前查找（最接近的優先）
  for (let i = languagePatterns.length - 1; i >= 0; i--) {
    const pattern = languagePatterns[i];
    if (!pattern) continue;
    const matches = textOnly.match(pattern);
    if (matches && matches[1]) {
      const lang = matches[1].toLowerCase();
      // 標準化語言名稱
      if (lang === 'py') return 'python';
      if (lang === 'js') return 'javascript';
      if (lang === 'ts') return 'typescript';
      if (lang === 'c++' || lang === 'cpp') return 'cpp';
      if (lang === 'c#') return 'csharp';
      if (lang === 'rb') return 'ruby';
      if (lang === 'golang') return 'go';
      if (lang === 'rs') return 'rust';
      if (lang === 'sh' || lang === 'shell') return 'bash';
      if (lang === 'yml') return 'yaml';
      if (lang === 'md') return 'markdown';
      return lang;
    }
  }

  return '';
}

/**
 * 轉換程式碼區塊 (<pre><code>) 為 Markdown 程式碼區塊
 */
export const convertCodeBlocks: ConversionRule = (html, options) => {
  let result = html;
  // 保存原始 HTML 用於提取前面的文字（因為 result 會被修改）
  const originalHtml = html;

  // 處理 <code-block> 包裝的 <pre><code> 格式（Gemini 使用）
  // 這個必須先處理，因為它包含其他格式
  result = result.replace(
    /<code-block[^>]*>([\s\S]*?)<\/code-block>/gi,
    (match, innerContent, offset) => {
      // 提取 code-block 的屬性
      const codeBlockMatch = match.match(/<code-block([^>]*)>/i);
      const codeBlockAttrs = codeBlockMatch && codeBlockMatch[1] ? codeBlockMatch[1] : '';

      // 嘗試從 code-block 屬性提取語言
      let language = extractLanguage(codeBlockAttrs);

      // 如果沒有找到，從前面的文字提取（使用原始 HTML）
      if (!language) {
        language = extractLanguageFromPrecedingText(originalHtml, offset);
      }

      // 處理內部的 <pre><code> 結構
      const preCodeMatch = innerContent.match(
        /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/i
      );

      if (preCodeMatch) {
        const codeContent = preCodeMatch[1];
        // 如果還沒有語言，從 hljs 類別推斷
        if (!language) {
          language = inferLanguageFromHljs(codeContent);
        }
        const code = codeContent.replace(/<[^>]+>/g, '').trim();
        return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
      }

      // 如果沒有 <pre><code> 結構，直接處理內容
      const code = innerContent.replace(/<[^>]+>/g, '').trim();
      if (!language) {
        language = inferLanguageFromHljs(innerContent);
      }
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
  );

  // 處理 <pre><code class="language-xxx">...</code></pre> 格式
  result = result.replace(
    /<pre[^>]*>\s*<code[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, classAttr, content, offset) => {
      let language = extractLanguage(classAttr);
      // 如果沒有找到語言，從 hljs 類別推斷
      if (!language) {
        language = inferLanguageFromHljs(content);
      }
      // 如果還是沒有，從前面的文字提取（使用當前 result，因為這是第一次處理這種格式）
      if (!language) {
        language = extractLanguageFromPrecedingText(result, offset);
      }
      // 最後使用預設值
      language = language || options?.defaultCodeLanguage || '';

      const code = content.replace(/<[^>]+>/g, '').trim();
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
  );

  // 處理 <pre class="language-xxx"><code>...</code></pre> 格式
  result = result.replace(
    /<pre[^>]*class=["']([^"']*)["'][^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, classAttr, content, offset) => {
      let language = extractLanguage(classAttr);
      // 如果沒有找到語言，從 hljs 類別推斷
      if (!language) {
        language = inferLanguageFromHljs(content);
      }
      // 如果還是沒有，從前面的文字提取
      if (!language) {
        language = extractLanguageFromPrecedingText(result, offset);
      }
      // 最後使用預設值
      language = language || options?.defaultCodeLanguage || '';

      const code = content.replace(/<[^>]+>/g, '').trim();
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
  );

  // 處理無語言標記的 <pre><code>...</code></pre>
  result = result.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, content, offset) => {
      let language = inferLanguageFromHljs(content);
      // 如果沒有找到語言，從前面的文字提取
      if (!language) {
        language = extractLanguageFromPrecedingText(result, offset);
      }
      // 最後使用預設值
      language = language || options?.defaultCodeLanguage || '';

      const code = content.replace(/<[^>]+>/g, '').trim();
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
  );

  // 處理獨立的 <pre>...</pre>（無 code 標籤）
  result = result.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, content, offset) => {
    let language = inferLanguageFromHljs(content);
    // 如果沒有找到語言，從前面的文字提取
    if (!language) {
      language = extractLanguageFromPrecedingText(result, offset);
    }
    // 最後使用預設值
    language = language || options?.defaultCodeLanguage || '';

    const code = content.replace(/<[^>]+>/g, '').trim();
    return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
  });

  return result;
};

/**
 * 轉換行內程式碼 (<code>) 為 Markdown 行內程式碼
 */
export const convertInlineCode: ConversionRule = (html) => {
  // 處理行內 <code> 標籤（不在 <pre> 內的）
  return html.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, content) => {
    const code = content.replace(/<[^>]+>/g, '').trim();
    // 如果程式碼包含反引號，使用雙反引號
    if (code.includes('`')) {
      return `\`\` ${code} \`\``;
    }
    return `\`${code}\``;
  });
};
