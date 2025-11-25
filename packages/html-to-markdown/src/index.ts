/**
 * HTML 轉 Markdown 轉換器套件入口
 *
 * @module @ai-chat-saver/html-to-markdown
 */

// 主要轉換函數
export { htmlToMarkdown, htmlToMarkdownWithResources } from './converter';

// 型別定義
export type { ConvertOptions, ConversionResult, ConversionRule } from './types';
export { DEFAULT_OPTIONS } from './types';

// 工具函數
export { decodeHtmlEntities, escapeMarkdown } from './entities';

// 個別轉換規則（供進階使用）
export { convertHeadings } from './rules/headings';
export { convertCodeBlocks, convertInlineCode } from './rules/code';
export { convertLists, convertUnorderedLists, convertOrderedLists } from './rules/lists';
export { convertTables } from './rules/tables';
export { convertLinks, convertImages, convertLinksAndImages } from './rules/links';
export {
  convertBold,
  convertItalic,
  convertStrikethrough,
  convertBlockquote,
  convertLineBreaks,
  convertParagraphs,
  convertHorizontalRules,
  convertTextFormatting,
  removeRemainingTags,
  cleanupOutput,
} from './rules/text';
