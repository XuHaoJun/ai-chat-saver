/**
 * 訊息相關型別定義
 *
 * @module shared-types/message
 */

/**
 * 訊息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 附加檔案類型
 */
export type AttachmentType = 'file' | 'image' | 'code';

/**
 * 附加檔案
 */
export interface Attachment {
  /** 檔案類型 */
  type: AttachmentType;

  /** 檔案名稱 */
  filename: string;

  /** 檔案 URL（如果可存取） */
  url?: string;

  /** 檔案說明 */
  description?: string;

  /** MIME 類型 */
  mimeType?: string;
}

/**
 * 來源引用
 */
export interface Source {
  /** 來源標題 */
  title: string;

  /** 來源 URL */
  url: string;

  /** 來源片段（可選） */
  snippet?: string;

  /** 來源索引 */
  index?: number;
}

/**
 * 訊息實體 - 對話中的單一訊息
 */
export interface Message {
  /** 訊息索引（在對話中的順序） */
  index: number;

  /** 訊息角色 */
  role: MessageRole;

  /** 訊息內容（HTML 或純文字） */
  content: string;

  /** 內容格式 */
  contentFormat: 'html' | 'text' | 'markdown';

  /** 訊息時間戳（如果平台提供） */
  timestamp?: Date;

  /** 附加檔案/輸入（如 Claude 的檔案上傳） */
  attachments?: Attachment[];

  /** 來源引用（如 Perplexity 的搜尋結果） */
  sources?: Source[];
}

