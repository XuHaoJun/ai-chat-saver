/**
 * 內部訊息傳遞契約
 *
 * 定義 Background Script 與 Content Script 之間的訊息格式
 *
 * @module contracts/messaging
 */

// ============================================================================
// 訊息類型
// ============================================================================

/**
 * 所有支援的訊息類型
 */
export type MessageType = 'PING' | 'EXTRACT_CONTENT' | 'EXPORT_CONTENT' | 'SETTINGS_UPDATED';

// ============================================================================
// 請求訊息
// ============================================================================

/**
 * Ping 請求 - 檢查 Content Script 是否已載入
 */
export interface PingRequest {
  type: 'PING';
}

/**
 * 提取內容請求 - 從目前頁面提取對話內容
 */
export interface ExtractContentRequest {
  type: 'EXTRACT_CONTENT';
  /** 平台提取設定 */
  pageConfig: ExtractionConfig;
  /** 頁面資訊 */
  pageInfos: PageInfos;
  /** 使用者設定 */
  userConfig: UserConfig;
}

/**
 * 匯出內容請求 - 觸發檔案下載
 */
export interface ExportContentRequest {
  type: 'EXPORT_CONTENT';
  /** 格式化後的輸出內容 */
  outputContent: string;
  /** 檔案名稱（不含副檔名） */
  filename: string;
  /** 媒體資產（如果有） */
  assets?: Asset[];
}

/**
 * 設定更新通知
 */
export interface SettingsUpdatedRequest {
  type: 'SETTINGS_UPDATED';
  /** 通知訊息 */
  message: string;
}

/**
 * 所有請求訊息的聯合型別
 */
export type RequestMessage =
  | PingRequest
  | ExtractContentRequest
  | ExportContentRequest
  | SettingsUpdatedRequest;

// ============================================================================
// 回應訊息
// ============================================================================

/**
 * Ping 回應
 */
export interface PingResponse {
  success: true;
  loaded: true;
}

/**
 * 提取內容成功回應
 */
export interface ExtractContentSuccessResponse {
  success: true;
  data: {
    /** 頁面標題 */
    title: string;
    /** 原始 HTML（備用） */
    html: string;
    /** 結構化區塊 */
    sections: ExtractedSection[];
  };
}

/**
 * 提取內容失敗回應
 */
export interface ExtractContentErrorResponse {
  success: false;
  error: string;
}

/**
 * 提取內容回應
 */
export type ExtractContentResponse = ExtractContentSuccessResponse | ExtractContentErrorResponse;

/**
 * 匯出內容回應
 */
export interface ExportContentResponse {
  success: boolean;
  error?: string;
}

/**
 * 設定更新回應
 */
export interface SettingsUpdatedResponse {
  success: boolean;
}

// ============================================================================
// 共用型別（與 data-model 對應）
// ============================================================================

/**
 * 平台提取設定（簡化版，完整定義見 data-model.md）
 */
export interface ExtractionConfig {
  domainName: string;
  pageTitle: { selector: string };
  contentSelector: string;
  extractionType: string;
  messageConfig?: Record<string, unknown>;
  sectionConfig?: Record<string, unknown>;
  sourcesExtraction?: Record<string, unknown>;
}

/**
 * 頁面資訊
 */
export interface PageInfos {
  /** Tab ID */
  id: number;
  /** 頁面 URL */
  url: string;
  /** 頁面標題 */
  title?: string;
  /** 可提取的平台名稱 */
  extractablePage: string;
}

/**
 * 使用者設定
 */
export interface UserConfig {
  /** 包含頁面標題 */
  includePageTitle: boolean;
  /** 包含來源引用 */
  includeSources: boolean;
  /** 格式化 Markdown */
  formatMarkdown: boolean;
  /** 檔名範本 */
  filenameTemplate: string;
  /** Webhook URL */
  webhookUrl: string;
  /** 輸出選項 */
  outputOptions: {
    localDownload: boolean;
    webhook: boolean;
  };
}

/**
 * 提取區塊
 */
export type ExtractedSection =
  | { type: 'message'; role: string; content: string; inputs?: string[]; sources?: Source[] }
  | {
      type: 'search-qa';
      question: string | null;
      answer: string | null;
      model?: string | null;
      sources?: Source[];
    }
  | { type: 'article'; content: string; sources?: Source[] }
  | { type: 'generic'; html: string };

/**
 * 來源引用
 */
export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

/**
 * 媒體資產
 */
export interface Asset {
  filename: string;
  type: 'image' | 'file';
  data: Blob | ArrayBuffer;
  sourceUrl: string;
}

// ============================================================================
// 訊息處理器型別
// ============================================================================

/**
 * 訊息處理器函數型別
 */
export type MessageHandler<TRequest, TResponse> = (
  message: TRequest,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: TResponse) => void
) => boolean | void;

/**
 * 訊息監聽器設定
 */
export interface MessageListenerConfig {
  /** 處理 PING */
  onPing?: MessageHandler<PingRequest, PingResponse>;
  /** 處理 EXTRACT_CONTENT */
  onExtractContent?: MessageHandler<ExtractContentRequest, ExtractContentResponse>;
  /** 處理 EXPORT_CONTENT */
  onExportContent?: MessageHandler<ExportContentRequest, ExportContentResponse>;
  /** 處理 SETTINGS_UPDATED */
  onSettingsUpdated?: MessageHandler<SettingsUpdatedRequest, SettingsUpdatedResponse>;
}
