/**
 * HTML 轉 Markdown 轉換器型別定義
 *
 * @module html-to-markdown/types
 */

/**
 * 轉換選項
 */
export interface ConvertOptions {
  /** 是否保留空白行 */
  preserveEmptyLines?: boolean;

  /** 是否轉換連結 */
  convertLinks?: boolean;

  /** 是否轉換圖片 */
  convertImages?: boolean;

  /** 程式碼區塊預設語言 */
  defaultCodeLanguage?: string;

  /** 是否移除註解 */
  removeComments?: boolean;

  /** 是否解碼 HTML 實體 */
  decodeEntities?: boolean;
}

/**
 * 預設轉換選項
 */
export const DEFAULT_OPTIONS: ConvertOptions = {
  preserveEmptyLines: false,
  convertLinks: true,
  convertImages: true,
  defaultCodeLanguage: '',
  removeComments: true,
  decodeEntities: true,
};

/**
 * 轉換規則函數型別
 */
export type ConversionRule = (html: string, options?: ConvertOptions) => string;

/**
 * 轉換結果
 */
export interface ConversionResult {
  /** Markdown 輸出 */
  markdown: string;

  /** 提取的圖片 URL 列表 */
  imageUrls: string[];

  /** 提取的連結列表 */
  links: Array<{ text: string; url: string }>;
}
