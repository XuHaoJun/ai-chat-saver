# Data Model: AI Chat Conversation Exporter

**Branch**: `001-ai-chat-exporter` | **Date**: 2025-01-27

## 實體關係圖

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Data Flow Overview                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────────────┐    │
│  │ Platform DOM │───▶│ ExtractedContent │───▶│ FormattedOutput       │    │
│  │ (HTML)       │    │ (Structured)     │    │ (Markdown + Assets)   │    │
│  └──────────────┘    └──────────────────┘    └───────────────────────┘    │
│         ▲                    │                         │                   │
│         │                    │                         ▼                   │
│  ┌──────┴───────┐     ┌─────▼────────┐       ┌───────────────────┐       │
│  │ Extraction   │     │ HTML to MD   │       │ Output Manager    │       │
│  │ Config       │     │ Converter    │       │ (Download/Webhook)│       │
│  └──────────────┘     └──────────────┘       └───────────────────┘       │
│                                                       │                   │
│                              ┌─────────────────────────┘                   │
│                              ▼                                             │
│                      ┌───────────────┐                                     │
│                      │ Export Config │                                     │
│                      │ (User Prefs)  │                                     │
│                      └───────────────┘                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 核心實體

### 1. Conversation（對話）

代表一次完整的 AI 聊天對話，包含多個訊息。

```typescript
// packages/shared-types/src/conversation.ts

/**
 * 對話實體 - 代表一次完整的 AI 聊天對話
 */
interface Conversation {
  /** 對話唯一識別碼（可選，來自平台） */
  id?: string;

  /** 對話標題 */
  title: string;

  /** 來源平台 */
  platform: Platform;

  /** 原始頁面 URL */
  sourceUrl: string;

  /** 提取時間 */
  extractedAt: Date;

  /** 訊息陣列 */
  messages: Message[];

  /** 對話 metadata（可選） */
  metadata?: ConversationMetadata;
}

/**
 * 對話 metadata
 */
interface ConversationMetadata {
  /** 對話建立時間（如果平台提供） */
  createdAt?: Date;

  /** 對話更新時間（如果平台提供） */
  updatedAt?: Date;

  /** 使用的模型（如果平台提供） */
  model?: string;

  /** 其他平台特定資訊 */
  extra?: Record<string, unknown>;
}

/**
 * 支援的平台
 */
type Platform = 'chatgpt' | 'claude' | 'perplexity' | 'phind' | 'deepwiki' | 'gemini';
```

### 2. Message（訊息）

代表對話中的單一訊息，可能是使用者輸入或 AI 回應。

```typescript
// packages/shared-types/src/message.ts

/**
 * 訊息實體 - 對話中的單一訊息
 */
interface Message {
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

/**
 * 訊息角色
 */
type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 附加檔案
 */
interface Attachment {
  /** 檔案類型 */
  type: 'file' | 'image' | 'code';

  /** 檔案名稱 */
  filename: string;

  /** 檔案 URL（如果可存取） */
  url?: string;

  /** 檔案說明 */
  description?: string;
}

/**
 * 來源引用
 */
interface Source {
  /** 來源標題 */
  title: string;

  /** 來源 URL */
  url: string;

  /** 來源片段（可選） */
  snippet?: string;
}
```

### 3. ExtractionConfig（提取設定）

定義特定平台的 DOM 選擇器與提取邏輯。

```typescript
// packages/extraction-configs/src/types.ts

/**
 * 平台提取設定 - 定義如何從 DOM 提取對話內容
 */
interface ExtractionConfig {
  /** 平台顯示名稱 */
  domainName: string;

  /** 允許提取的 URL 模式 */
  allowedUrls: string[];

  /** 頁面標題選擇器 */
  pageTitle: SelectorConfig;

  /** 對話內容容器選擇器 */
  contentSelector: string;

  /** 提取類型 */
  extractionType: ExtractionType;

  /** 訊息設定（用於 message-list 類型） */
  messageConfig?: MessageExtractionConfig;

  /** 區塊設定（用於 search-sections 類型） */
  sectionConfig?: SectionExtractionConfig;

  /** 來源提取設定 */
  sourcesExtraction?: SourcesExtractionConfig;

  /** 提取前後動作（如點擊展開） */
  actions?: ExtractionActions;
}

/**
 * 提取類型
 */
type ExtractionType =
  | 'message-list' // 訊息列表（ChatGPT, Claude）
  | 'search-sections' // 搜尋區塊（Perplexity, Phind）
  | 'articles-sections' // 文章區塊
  | 'full-page'; // 全頁面

/**
 * 選擇器設定
 */
interface SelectorConfig {
  /** CSS 選擇器 */
  selector: string;

  /** 多重選擇器（依序嘗試） */
  fallbackSelectors?: string[];
}

/**
 * 訊息提取設定
 */
interface MessageExtractionConfig {
  /** 角色選擇器 */
  roleSelector?: string;

  /** 角色屬性名稱 */
  roleAttribute?: string;

  /** 內容選擇器 */
  contentSelector?: string;

  /** 使用者訊息選擇器 */
  userSelector?: string;

  /** AI 訊息選擇器 */
  assistantSelector?: string;

  /** 角色對應表 */
  roles: {
    user: string;
    assistant: string;
  };

  /** 附件選擇器 */
  attachmentsSelector?: string;
}

/**
 * 區塊提取設定（用於 search-sections）
 */
interface SectionExtractionConfig {
  /** 使用者問題選擇器 */
  userQuestionSelector: string;

  /** AI 回答選擇器 */
  aiAnswerSelector: string;

  /** AI 模型選擇器 */
  aiModelSelector?: string;
}

/**
 * 來源提取設定
 */
interface SourcesExtractionConfig {
  /** 選擇器設定陣列 */
  selectors: SourceSelectorConfig[];

  /** 提取後動作（如關閉彈窗） */
  afterAction?: string;
}

/**
 * 來源選擇器設定
 */
interface SourceSelectorConfig {
  /** 開啟來源面板的動作 */
  open?: ActionConfig[];

  /** 關閉來源面板的動作 */
  close?: ActionConfig[];

  /** 來源元素選擇器 */
  selector: string;

  /** 提取類型 */
  extractionType: 'list' | 'tile-list';

  /** 選擇器作用範圍 */
  scope?: 'content' | 'document';
}

/**
 * 動作設定
 */
interface ActionConfig {
  /** 點擊選擇器 */
  selector: string;

  /** 作用範圍 */
  scope: 'content' | 'document';

  /** 等待時間（毫秒） */
  wait?: number;
}

/**
 * 提取動作設定
 */
interface ExtractionActions {
  /** 提取前動作 */
  beforeExtraction?: {
    type: 'click';
    selector: string;
  };

  /** 提取後動作 */
  afterExtraction?: {
    type: 'click' | 'click_act_close';
    selector?: string;
  };
}
```

### 4. ExportConfig（匯出設定）

使用者可配置的匯出偏好設定。

```typescript
// packages/shared-types/src/config.ts

/**
 * 匯出設定 - 使用者偏好設定
 */
interface ExportConfig {
  /** 檔名範本 */
  filenameTemplate: string;

  /** 輸出選項 */
  outputOptions: OutputOptions;

  /** 內容選項 */
  contentOptions: ContentOptions;
}

/**
 * 輸出選項
 */
interface OutputOptions {
  /** 啟用本地下載 */
  localDownload: boolean;

  /** 啟用 Webhook */
  webhook: boolean;

  /** Webhook URL（如果啟用） */
  webhookUrl?: string;
}

/**
 * 內容選項
 */
interface ContentOptions {
  /** 包含 metadata 標頭 */
  includeMetadata: boolean;

  /** 包含來源引用 */
  includeSources: boolean;

  /** 包含附件資訊 */
  includeAttachments: boolean;

  /** 下載媒體檔案 */
  downloadMedia: boolean;
}

/**
 * 檔名範本佔位符
 */
type FilenameTemplatePlaceholder =
  | '%Y' // 年（四位）
  | '%M' // 月（兩位）
  | '%D' // 日（兩位）
  | '%h' // 時（兩位，24 小時制）
  | '%m' // 分（兩位）
  | '%s' // 秒（兩位）
  | '%t' // Unix 時間戳
  | '%W' // 平台名稱
  | '%H' // 主機名稱
  | '%T'; // 對話標題（清理後）
```

### 5. ExtractedContent（提取內容）

從 DOM 提取後的結構化內容。

```typescript
// apps/extension/src/types/extraction.ts

/**
 * 提取內容 - 從 DOM 提取後的結構化資料
 */
interface ExtractedContent {
  /** 是否成功 */
  success: boolean;

  /** 資料（成功時） */
  data?: ExtractedData;

  /** 錯誤訊息（失敗時） */
  error?: string;
}

/**
 * 提取資料
 */
interface ExtractedData {
  /** 頁面標題 */
  title: string;

  /** 原始 HTML（備用） */
  html: string;

  /** 結構化區塊 */
  sections: ExtractedSection[];
}

/**
 * 提取區塊
 */
type ExtractedSection = MessageSection | SearchQASection | ArticleSection | GenericSection;

/**
 * 訊息區塊
 */
interface MessageSection {
  type: 'message';
  role: string;
  content: string;
  inputs?: string[];
  sources?: Source[];
}

/**
 * 搜尋問答區塊
 */
interface SearchQASection {
  type: 'search-qa';
  question: string | null;
  answer: string | null;
  model?: string | null;
  sources?: Source[];
}

/**
 * 文章區塊
 */
interface ArticleSection {
  type: 'article';
  content: string;
  sources?: Source[];
}

/**
 * 通用區塊
 */
interface GenericSection {
  type: 'generic';
  html: string;
}
```

### 6. ExportOutput（匯出輸出）

最終匯出的內容結構。

```typescript
// apps/extension/src/types/output.ts

/**
 * 匯出內容 - 準備輸出的最終內容
 */
interface ExportContent {
  /** Markdown 內容 */
  markdown: string;

  /** 媒體資產 */
  assets: Asset[];

  /** 匯出 metadata */
  metadata: ExportMetadata;
}

/**
 * 媒體資產
 */
interface Asset {
  /** 檔案名稱 */
  filename: string;

  /** 檔案類型 */
  type: 'image' | 'file';

  /** 檔案資料（Blob 或 ArrayBuffer） */
  data: Blob | ArrayBuffer;

  /** 原始 URL */
  sourceUrl: string;
}

/**
 * 匯出 metadata
 */
interface ExportMetadata {
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
}

/**
 * 匯出選項
 */
interface ExportOptions {
  /** 檔案名稱（不含副檔名） */
  filename: string;

  /** 是否包含 metadata */
  includeMetadata: boolean;
}

/**
 * 匯出結果
 */
interface ExportResult {
  /** 是否成功 */
  success: boolean;

  /** 目的地名稱 */
  destination: string;

  /** 錯誤訊息（失敗時） */
  error?: string;

  /** 額外資訊 */
  details?: Record<string, unknown>;
}

/**
 * 輸出目的地介面
 */
interface OutputDestination {
  /** 目的地名稱 */
  readonly name: string;

  /** 是否啟用 */
  enabled: boolean;

  /** 執行匯出 */
  export(content: ExportContent, options: ExportOptions): Promise<ExportResult>;
}
```

---

## 狀態轉換

### 提取流程狀態

```text
┌─────────┐    點擊圖示     ┌──────────┐   偵測平台    ┌───────────┐
│  Idle   │ ──────────────▶ │ Checking │ ────────────▶ │ Supported │
└─────────┘                 └──────────┘               └───────────┘
                                  │                          │
                            不支援的頁面                  載入設定
                                  │                          │
                                  ▼                          ▼
                           ┌───────────┐              ┌────────────┐
                           │ Unsupported│              │ Extracting │
                           └───────────┘              └────────────┘
                                  │                          │
                            顯示通知                    提取完成/失敗
                                  │                          │
                                  ▼                          ▼
                           ┌─────────┐     ┌───────────┐    ┌───────┐
                           │  Idle   │ ◀── │ Formatting │ ◀─ │ Error │
                           └─────────┘     └───────────┘    └───────┘
                                                │
                                           格式化完成
                                                │
                                                ▼
                                          ┌───────────┐
                                          │ Exporting │
                                          └───────────┘
                                                │
                                           匯出完成
                                                │
                                                ▼
                                          ┌───────────┐
                                          │ Complete  │
                                          └───────────┘
                                                │
                                                │
                                                ▼
                                          ┌─────────┐
                                          │  Idle   │
                                          └─────────┘
```

### 狀態型別

```typescript
type ExtractionState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'unsupported'; message: string }
  | { status: 'extracting'; platform: Platform }
  | { status: 'formatting' }
  | { status: 'exporting'; destinations: string[] }
  | { status: 'complete'; results: ExportResult[] }
  | { status: 'error'; error: string };
```

---

## 驗證規則

### ExportConfig 驗證

```typescript
const exportConfigSchema = {
  filenameTemplate: {
    required: true,
    minLength: 1,
    maxLength: 200,
    // 必須包含至少一個有效佔位符或文字
  },
  outputOptions: {
    // 至少啟用一個輸出目的地
    validate: (opts) => opts.localDownload || opts.webhook,
    webhookUrl: {
      // 如果 webhook 啟用，必須是有效 URL
      required: (opts) => opts.webhook,
      pattern: /^https?:\/\/.+/,
    },
  },
};
```

### ExtractionConfig 驗證

```typescript
const extractionConfigSchema = {
  domainName: { required: true, minLength: 1 },
  allowedUrls: { required: true, minItems: 1 },
  pageTitle: {
    selector: { required: true },
  },
  contentSelector: { required: true },
  extractionType: {
    required: true,
    enum: ['message-list', 'search-sections', 'articles-sections', 'full-page'],
  },
  // messageConfig 或 sectionConfig 根據 extractionType 驗證
};
```

---

## 儲存結構

### Browser Storage (chrome.storage.sync)

```typescript
interface StorageSchema {
  // 匯出設定
  filenameTemplate: string;
  webhookUrl: string;
  outputOptions: {
    localDownload: boolean;
    webhook: boolean;
  };

  // 內容設定
  includeMetadata: boolean;
  includeSources: boolean;
  downloadMedia: boolean;

  // UI 設定
  lastUsedPlatform?: Platform;
  exportCount?: number;
}

// 預設值
const defaultStorage: StorageSchema = {
  filenameTemplate: '%Y-%M-%D_%h-%m-%s_%W_%T',
  webhookUrl: '',
  outputOptions: {
    localDownload: true,
    webhook: false,
  },
  includeMetadata: true,
  includeSources: true,
  downloadMedia: true,
};
```
