/**
 * 輸出相關型別定義
 *
 * @module extension/types/output
 */

/**
 * 媒體資產
 */
export interface Asset {
  /** 檔案名稱 */
  filename: string;

  /** 檔案類型 */
  type: 'image' | 'file';

  /** 檔案資料 */
  data: Blob | ArrayBuffer;

  /** 原始 URL */
  sourceUrl: string;

  /** MIME 類型 */
  mimeType?: string;
}

/**
 * 匯出 metadata
 */
export interface ExportMetadata {
  /** 平台名稱 */
  platform: string;

  /** 對話標題 */
  title: string;

  /** 原始 URL */
  sourceUrl: string;

  /** 匯出時間 */
  exportedAt: Date;

  /** 訊息數量 */
  messageCount: number;

  /** 來源數量（如果有） */
  sourceCount?: number;
}

/**
 * 匯出內容
 */
export interface ExportContent {
  /** Markdown 內容 */
  markdown: string;

  /** 媒體資產 */
  assets: Asset[];

  /** 匯出 metadata */
  metadata: ExportMetadata;
}

/**
 * 匯出選項
 */
export interface ExportOptions {
  /** 檔案名稱（不含副檔名） */
  filename: string;

  /** 是否包含 metadata 標頭 */
  includeMetadata: boolean;
}

/**
 * 匯出結果
 */
export interface ExportResult {
  /** 是否成功 */
  success: boolean;

  /** 目的地名稱 */
  destination: string;

  /** 錯誤訊息（失敗時） */
  error?: string;

  /** 額外詳細資訊 */
  details?: {
    /** 檔案大小（位元組） */
    fileSize?: number;

    /** 下載 URL（如果適用） */
    downloadUrl?: string;

    /** 耗時（毫秒） */
    duration?: number;
  };
}

/**
 * 輸出目的地介面
 */
export interface OutputDestination {
  /** 目的地唯一名稱 */
  readonly name: string;

  /** 目的地顯示名稱 */
  readonly displayName: string;

  /** 目的地描述 */
  readonly description: string;

  /** 是否啟用 */
  enabled: boolean;

  /** 是否需要額外設定 */
  readonly requiresConfiguration: boolean;

  /** 執行匯出 */
  export(content: ExportContent, options: ExportOptions): Promise<ExportResult>;
}

