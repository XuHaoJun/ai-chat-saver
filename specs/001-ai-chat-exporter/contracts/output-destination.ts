/**
 * 輸出目的地契約
 * 
 * 定義可擴展的輸出目的地介面，
 * 支援未來新增雲端儲存等目的地
 * 
 * @module contracts/output-destination
 */

// ============================================================================
// 核心介面
// ============================================================================

/**
 * 輸出目的地介面
 * 
 * 所有輸出目的地都必須實作此介面。
 * 這是一個策略模式的實作，允許未來輕鬆新增新的輸出目的地。
 * 
 * @example
 * ```typescript
 * class LocalDownloadDestination implements OutputDestination {
 *   readonly name = 'local-download';
 *   enabled = true;
 *   
 *   async export(content, options) {
 *     // 實作下載邏輯
 *     return { success: true, destination: this.name };
 *   }
 * }
 * ```
 */
export interface OutputDestination {
  /**
   * 目的地唯一名稱
   * 
   * 用於識別和設定
   */
  readonly name: string;

  /**
   * 目的地顯示名稱（用於 UI）
   */
  readonly displayName: string;

  /**
   * 目的地描述
   */
  readonly description: string;

  /**
   * 是否啟用
   * 
   * 可由使用者設定控制
   */
  enabled: boolean;

  /**
   * 是否需要額外設定
   * 
   * 例如 Webhook 需要 URL
   */
  readonly requiresConfiguration: boolean;

  /**
   * 執行匯出
   * 
   * @param content - 要匯出的內容
   * @param options - 匯出選項
   * @returns 匯出結果
   */
  export(content: ExportContent, options: ExportOptions): Promise<ExportResult>;

  /**
   * 驗證設定是否有效
   * 
   * @returns 驗證結果
   */
  validateConfiguration?(): ConfigurationValidation;
}

// ============================================================================
// 資料型別
// ============================================================================

/**
 * 匯出內容
 */
export interface ExportContent {
  /**
   * Markdown 內容
   */
  markdown: string;

  /**
   * 媒體資產
   * 
   * 如果有媒體檔案，會自動產生 ZIP
   */
  assets: Asset[];

  /**
   * 匯出 metadata
   */
  metadata: ExportMetadata;
}

/**
 * 媒體資產
 */
export interface Asset {
  /**
   * 檔案名稱
   */
  filename: string;

  /**
   * 檔案類型
   */
  type: 'image' | 'file';

  /**
   * 檔案資料
   */
  data: Blob | ArrayBuffer;

  /**
   * 原始 URL
   */
  sourceUrl: string;

  /**
   * MIME 類型
   */
  mimeType?: string;
}

/**
 * 匯出 metadata
 */
export interface ExportMetadata {
  /**
   * 平台名稱
   */
  platform: string;

  /**
   * 對話標題
   */
  title: string;

  /**
   * 原始 URL
   */
  sourceUrl: string;

  /**
   * 匯出時間
   */
  exportedAt: Date;

  /**
   * 訊息數量
   */
  messageCount: number;

  /**
   * 來源數量（如果有）
   */
  sourceCount?: number;
}

/**
 * 匯出選項
 */
export interface ExportOptions {
  /**
   * 檔案名稱（不含副檔名）
   */
  filename: string;

  /**
   * 是否包含 metadata 標頭
   */
  includeMetadata: boolean;
}

/**
 * 匯出結果
 */
export interface ExportResult {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 目的地名稱
   */
  destination: string;

  /**
   * 錯誤訊息（失敗時）
   */
  error?: string;

  /**
   * 額外詳細資訊
   */
  details?: {
    /**
     * 檔案大小（位元組）
     */
    fileSize?: number;

    /**
     * 下載 URL（如果適用）
     */
    downloadUrl?: string;

    /**
     * 耗時（毫秒）
     */
    duration?: number;
  };
}

/**
 * 設定驗證結果
 */
export interface ConfigurationValidation {
  /**
   * 是否有效
   */
  valid: boolean;

  /**
   * 錯誤訊息列表
   */
  errors: string[];
}

// ============================================================================
// 目的地管理器
// ============================================================================

/**
 * 輸出管理器介面
 * 
 * 管理所有輸出目的地，協調匯出流程
 */
export interface OutputManager {
  /**
   * 註冊新的輸出目的地
   * 
   * @param destination - 輸出目的地實例
   */
  register(destination: OutputDestination): void;

  /**
   * 取得所有已註冊的目的地
   */
  getDestinations(): OutputDestination[];

  /**
   * 取得已啟用的目的地
   */
  getEnabledDestinations(): OutputDestination[];

  /**
   * 根據名稱取得目的地
   * 
   * @param name - 目的地名稱
   */
  getDestination(name: string): OutputDestination | undefined;

  /**
   * 執行匯出到所有已啟用的目的地
   * 
   * @param content - 要匯出的內容
   * @param options - 匯出選項
   * @returns 所有目的地的匯出結果
   */
  exportToAll(content: ExportContent, options: ExportOptions): Promise<ExportResult[]>;

  /**
   * 執行匯出到指定目的地
   * 
   * @param destinationName - 目的地名稱
   * @param content - 要匯出的內容
   * @param options - 匯出選項
   */
  exportTo(
    destinationName: string,
    content: ExportContent,
    options: ExportOptions
  ): Promise<ExportResult>;
}

// ============================================================================
// 預定義目的地（現在實作）
// ============================================================================

/**
 * 本地下載目的地設定
 */
export interface LocalDownloadConfig {
  /**
   * 是否自動開啟下載資料夾
   * 
   * @default false
   */
  openFolder?: boolean;
}

/**
 * Webhook 目的地設定
 */
export interface WebhookConfig {
  /**
   * Webhook URL
   */
  url: string;

  /**
   * HTTP 方法
   * 
   * @default 'POST'
   */
  method?: 'POST' | 'PUT';

  /**
   * 自訂 Headers
   */
  headers?: Record<string, string>;

  /**
   * 請求格式
   * 
   * - 'multipart': multipart/form-data（預設）
   * - 'json': application/json
   * 
   * @default 'multipart'
   */
  format?: 'multipart' | 'json';
}

// ============================================================================
// 未來擴展目的地（僅型別定義，不實作）
// ============================================================================

/**
 * Google Drive 目的地設定（未來）
 */
export interface GoogleDriveConfig {
  /**
   * 目標資料夾 ID
   */
  folderId?: string;

  /**
   * 是否建立子資料夾
   */
  createSubfolder?: boolean;
}

/**
 * Notion 目的地設定（未來）
 */
export interface NotionConfig {
  /**
   * 資料庫 ID
   */
  databaseId: string;

  /**
   * 頁面屬性對應
   */
  propertyMapping?: Record<string, string>;
}

/**
 * Dropbox 目的地設定（未來）
 */
export interface DropboxConfig {
  /**
   * 目標路徑
   */
  path: string;
}

// ============================================================================
// 輔助函數
// ============================================================================

/**
 * 建立標準匯出結果（成功）
 */
export function createSuccessResult(
  destination: string,
  details?: ExportResult['details']
): ExportResult {
  return {
    success: true,
    destination,
    details,
  };
}

/**
 * 建立標準匯出結果（失敗）
 */
export function createErrorResult(
  destination: string,
  error: string
): ExportResult {
  return {
    success: false,
    destination,
    error,
  };
}

/**
 * 判斷是否需要產生 ZIP
 * 
 * @param content - 匯出內容
 * @returns 是否需要 ZIP
 */
export function shouldCreateZip(content: ExportContent): boolean {
  return content.assets.length > 0;
}

/**
 * 取得匯出檔案的副檔名
 * 
 * @param content - 匯出內容
 * @returns 副檔名（不含點）
 */
export function getFileExtension(content: ExportContent): string {
  return shouldCreateZip(content) ? 'zip' : 'md';
}

