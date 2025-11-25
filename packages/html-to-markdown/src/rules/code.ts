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
 * 轉換程式碼區塊 (<pre><code>) 為 Markdown 程式碼區塊
 */
export const convertCodeBlocks: ConversionRule = (html, options) => {
  let result = html;

  // 處理 <pre><code class="language-xxx">...</code></pre> 格式
  result = result.replace(
    /<pre[^>]*>\s*<code[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, classAttr, content) => {
      const language = extractLanguage(classAttr) || options?.defaultCodeLanguage || '';
      const code = content
        .replace(/<[^>]+>/g, '') // 移除內部 HTML 標籤
        .trim();
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
  );

  // 處理 <pre class="language-xxx"><code>...</code></pre> 格式
  result = result.replace(
    /<pre[^>]*class=["']([^"']*)["'][^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, classAttr, content) => {
      const language = extractLanguage(classAttr) || options?.defaultCodeLanguage || '';
      const code = content.replace(/<[^>]+>/g, '').trim();
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
  );

  // 處理無語言標記的 <pre><code>...</code></pre>
  result = result.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, content) => {
      const code = content.replace(/<[^>]+>/g, '').trim();
      const language = options?.defaultCodeLanguage || '';
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
  );

  // 處理獨立的 <pre>...</pre>（無 code 標籤）
  result = result.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, content) => {
    const code = content.replace(/<[^>]+>/g, '').trim();
    const language = options?.defaultCodeLanguage || '';
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

