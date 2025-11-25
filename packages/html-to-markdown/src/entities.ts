/**
 * HTML 實體解碼器
 *
 * @module html-to-markdown/entities
 */

/**
 * HTML 實體對應表
 */
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
  '&lsquo;': ''',
  '&rsquo;': ''',
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&laquo;': '«',
  '&raquo;': '»',
  '&bull;': '•',
  '&middot;': '·',
  '&para;': '¶',
  '&sect;': '§',
  '&dagger;': '†',
  '&Dagger;': '‡',
};

/**
 * 解碼數字實體
 */
function decodeNumericEntity(match: string, dec: string, hex: string): string {
  const codePoint = dec ? parseInt(dec, 10) : parseInt(hex, 16);
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return match;
  }
}

/**
 * 解碼 HTML 實體
 *
 * @param html - 包含 HTML 實體的字串
 * @returns 解碼後的字串
 */
export function decodeHtmlEntities(html: string): string {
  let result = html;

  // 解碼命名實體
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.replace(new RegExp(entity, 'gi'), char);
  }

  // 解碼十進位數字實體: &#123;
  result = result.replace(/&#(\d+);/g, (match, dec) => decodeNumericEntity(match, dec, ''));

  // 解碼十六進位數字實體: &#x7B;
  result = result.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) =>
    decodeNumericEntity(match, '', hex)
  );

  return result;
}

/**
 * 編碼特殊字元為 Markdown 安全格式
 *
 * @param text - 要編碼的文字
 * @returns 編碼後的文字
 */
export function escapeMarkdown(text: string): string {
  // 跳脫 Markdown 特殊字元
  return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1');
}

