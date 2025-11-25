# Research Document: AI Chat Conversation Exporter

**Branch**: `001-ai-chat-exporter` | **Date**: 2025-01-27

## 技術決策總覽

本文件記錄 Phase 0 研究階段的所有技術決策、替代方案評估與最終選擇理由。

---

## 1. HTML 轉 Markdown 轉換策略

### Decision: 自行實作基於正規表達式的轉換器

### Rationale
分析 SaveMyPhind 專案的 `html-to-md.imba`，發現其採用純正規表達式實作，原因：
1. **瀏覽器擴充功能限制**：Background Script（Service Worker）無法使用 DOMParser
2. **效能考量**：正規表達式處理速度快，適合處理大量對話
3. **可預測性**：AI 聊天平台的 HTML 結構相對固定，不需要完整 DOM 解析

### Alternatives Considered

| 方案 | 優點 | 缺點 | 結論 |
|------|------|------|------|
| Turndown.js | 功能完整、社群活躍 | 需要 DOM 環境、套件較大 | ❌ 不適用於 Service Worker |
| Unified/rehype | 強大的 AST 轉換 | 複雜度高、套件體積大 | ❌ 過度設計 |
| 自行實作（DOM） | 精確控制 | 僅限 Content Script | ⚠️ 可作為備選 |
| 自行實作（Regex） | 輕量、可於任何環境執行 | 需處理複雜巢狀結構 | ✅ 採用 |

### Implementation Reference
基於 SaveMyPhind 的轉換邏輯，支援：
- 標題（h1-h6）
- 程式碼區塊（含語言標記）
- 行內程式碼
- 粗體/斜體
- 連結/圖片
- 列表（有序/無序）
- 表格
- 區塊引用
- HTML 實體解碼

---

## 2. 建置系統選擇

### Decision: Turborepo + pnpm + Vite

### Rationale
1. **Turborepo**：使用者明確指定 monorepo 需求
2. **pnpm**：比 npm/yarn 更快、節省磁碟空間
3. **Vite**：SaveMyPhind 使用 Vite，已驗證適用於擴充功能建置

### Build Pipeline

```text
pnpm build
  ├── packages/html-to-markdown (先建置)
  ├── packages/extraction-configs
  ├── packages/shared-types
  └── apps/extension
        ├── chrome/ (Manifest V3)
        └── firefox/ (Manifest V2)
```

### Alternatives Considered

| 方案 | 優點 | 缺點 | 結論 |
|------|------|------|------|
| Nx | 功能強大、企業級 | 學習曲線陡峭、設定複雜 | ❌ 過度設計 |
| Lerna | 老牌工具 | 已不再積極維護 | ❌ |
| Turborepo | 簡單、快速、Vercel 支援 | 功能較 Nx 少 | ✅ 採用 |
| Webpack | 生態系成熟 | 設定繁瑣 | ❌ |
| Vite | 快速、簡潔、現代 | 較新 | ✅ 採用 |

---

## 3. UI 框架與樣式

### Decision: React 18 + shadcn/ui + Tailwind CSS v4

### Rationale
1. **使用者明確指定**此技術組合
2. **shadcn/ui**：可複製元件，不增加套件依賴
3. **Tailwind CSS v4**：CSS-first 設計、更好的效能

### Options Page Architecture

```typescript
// apps/extension/src/options/App.tsx
import { Card, Input, Switch, Button } from '@/components/ui';

export function OptionsApp() {
  // 設定狀態管理
  const [config, setConfig] = useState<ExportConfig>();
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <h1>AI Chat Saver 設定</h1>
        {/* 檔名範本設定 */}
        {/* 輸出選項設定 */}
        {/* 儲存按鈕 */}
      </Card>
    </div>
  );
}
```

---

## 4. 平台提取策略

### Decision: 設定驅動 + 策略模式

### Rationale
分析 SaveMyPhind 的 `extractionConfigs.imba`，發現其優點：
1. **集中管理**：所有平台選擇器集中於設定檔
2. **易於維護**：平台 UI 變更時只需更新選擇器
3. **可測試**：設定可獨立驗證

### Platform Support Analysis

| 平台 | URL 模式 | 提取類型 | SaveMyPhind 支援 | 複雜度 |
|------|----------|----------|------------------|--------|
| ChatGPT | chatgpt.com/c | message-list | ✅ | 中 |
| Claude | claude.ai/chat | message-list | ✅ | 中 |
| Perplexity | perplexity.ai/search | search-sections | ✅ | 高 |
| Phind | phind.com/search | search-sections | ✅ | 中 |
| deepwiki | deepwiki.com/* | 待分析 | ❌ | 待評估 |
| Gemini | gemini.google.com/* | 待分析 | ❌ | 待評估 |

### Extraction Types

```typescript
type ExtractionType = 
  | 'message-list'      // ChatGPT, Claude: 使用者/AI 交替訊息
  | 'search-sections'   // Perplexity, Phind: 問題/答案/來源區塊
  | 'articles-sections' // 文章類型（Perplexity Pages）
  | 'full-page';        // 全頁面提取（備選）
```

### DOM Selectors Strategy

每個平台需要定義：
1. **pageTitle**: 頁面標題選擇器
2. **contentSelector**: 對話內容容器
3. **messageConfig**: 訊息角色/內容選擇器
4. **sourcesExtraction**: 來源引用提取（可選）

---

## 5. 多檔案匯出與壓縮

### Decision: JSZip 用於前端壓縮

### Rationale
1. **瀏覽器相容**：JSZip 可在 Content Script 中執行
2. **無伺服器依賴**：純前端壓縮
3. **成熟穩定**：廣泛使用的 ZIP 套件

### Implementation

```typescript
// apps/extension/src/utils/zip.ts
import JSZip from 'jszip';

export async function createExportZip(
  markdown: string,
  assets: Asset[]
): Promise<Blob> {
  const zip = new JSZip();
  
  // 新增主要 Markdown 檔案
  zip.file('conversation.md', markdown);
  
  // 新增媒體檔案
  const assetsFolder = zip.folder('assets');
  for (const asset of assets) {
    assetsFolder?.file(asset.filename, asset.data);
  }
  
  return zip.generateAsync({ type: 'blob' });
}
```

### Export Decision Logic

```text
if (hasMediaFiles) {
  // 產生 ZIP 包含 MD + 媒體
  downloadZip(content, assets);
} else {
  // 直接下載單一 MD 檔案
  downloadMarkdown(content);
}
```

---

## 6. 跨瀏覽器相容性

### Decision: webextension-polyfill + 條件建置

### Rationale
SaveMyPhind 成功使用此策略支援 Chrome/Firefox。

### Browser Differences

| 功能 | Chrome (MV3) | Firefox (MV2) | 解決方案 |
|------|--------------|---------------|----------|
| Background | Service Worker | Background Script | webextension-polyfill |
| Action API | chrome.action | browser.browserAction | webextension-polyfill |
| Manifest | manifest_version: 3 | manifest_version: 2 | 建置時產生 |
| Host Permissions | host_permissions | permissions | 建置時處理 |

### Manifest Generation

```typescript
// scripts/manifest-generator.ts
const baseManifest = {
  name: 'AI Chat Saver',
  permissions: ['activeTab', 'storage', 'scripting']
};

function generateChromeManifest() {
  return {
    ...baseManifest,
    manifest_version: 3,
    background: { service_worker: 'background.js' },
    action: { default_icon: { /* ... */ } }
  };
}

function generateFirefoxManifest() {
  return {
    ...baseManifest,
    manifest_version: 2,
    background: { scripts: ['background.js'] },
    browser_action: { default_icon: { /* ... */ } }
  };
}
```

---

## 7. 輸出目的地架構

### Decision: 策略模式 + 可擴展介面

### Rationale
使用者要求「架構設計成未來不只下載檔案還能上傳雲端」，採用開放封閉原則。

### Interface Design

```typescript
// apps/extension/src/types/output.ts
interface ExportContent {
  markdown: string;
  assets: Asset[];
  metadata: ExportMetadata;
}

interface ExportOptions {
  filename: string;
  includeMetadata: boolean;
}

interface ExportResult {
  success: boolean;
  destination: string;
  error?: string;
}

interface OutputDestination {
  readonly name: string;
  readonly enabled: boolean;
  export(content: ExportContent, options: ExportOptions): Promise<ExportResult>;
}
```

### Current Implementations

```typescript
// 本地下載（P1 實作）
class LocalDownloadDestination implements OutputDestination {
  readonly name = 'local-download';
  readonly enabled = true;
  
  async export(content, options) {
    // 判斷是否需要 ZIP
    if (content.assets.length > 0) {
      return this.downloadZip(content, options);
    }
    return this.downloadMarkdown(content, options);
  }
}

// Webhook（P2 實作）
class WebhookDestination implements OutputDestination {
  readonly name = 'webhook';
  enabled = false; // 預設關閉，使用者設定啟用
  
  async export(content, options) {
    // POST to user-configured URL
  }
}
```

### Future Extensions (僅設計，不實作)

```typescript
// 未來可能的雲端目的地
// class GoogleDriveDestination implements OutputDestination { }
// class NotionDestination implements OutputDestination { }
// class DropboxDestination implements OutputDestination { }
```

---

## 8. 儲存策略

### Decision: chrome.storage.sync API

### Rationale
1. **跨裝置同步**：使用者設定自動同步
2. **容量足夠**：sync 配額 102.4 KB，足夠儲存設定
3. **SaveMyPhind 驗證**：已證明此方案可行

### Storage Schema

```typescript
interface StoredConfig {
  filenameTemplate: string;     // 預設: '%Y-%M-%D_%h-%m-%s_%W_%T'
  webhookUrl: string;           // 預設: ''
  outputOptions: {
    localDownload: boolean;     // 預設: true
    webhook: boolean;           // 預設: false
  };
  includeMetadata: boolean;     // 預設: true
  includeSources: boolean;      // 預設: true
}
```

---

## 9. deepwiki 與 Gemini 平台研究

> **參考樣本**：`tests/fixtures/html-samples/` 目錄包含預先下載的 HTML 範例

### deepwiki 分析

**已分析 HTML 樣本**：`deepwiki-normal-1.html`

**平台特性**：
- 框架：Next.js（React Server Components）
- URL 結構：`deepwiki.com/search/{slug}`
- 用途：GitHub 專案文件搜尋/問答

**DOM 結構發現**：

| 元素 | 選擇器 | 說明 |
|------|--------|------|
| 問答區塊 | `[data-query-index]` | 每個問答對有唯一索引 |
| 問答顯示 | `[data-query-display="true"]` | 顯示中的問答區塊 |
| 問題標題 | `.text-xl, .text-2xl` | 使用者問題 |
| 回答內容 | `.prose-custom` | AI 回答（Markdown 渲染後） |
| 來源引用 | `span[role="link"].text-pacific` | 程式碼來源參考 |
| 程式碼區塊 | `.react-syntax-highlighter-line-number` | 程式碼高亮區塊 |
| 內聯程式碼 | `code.rounded-sm` | 行內程式碼片段 |
| 專案連結 | `a[href^="/"]` 在標題區 | 返回專案頁面的連結 |

**提取設定建議**：

```typescript
export const deepwikiConfig: ExtractionConfig = {
  domainName: 'deepwiki',
  allowedUrls: ['deepwiki.com/search/'],
  pageTitle: { 
    selector: 'title',
    fallbackSelectors: ['.text-xl', '.text-2xl']
  },
  contentSelector: '[data-query-display="true"]',
  extractionType: 'search-sections',
  sectionConfig: {
    userQuestionSelector: '.text-xl, .text-2xl',
    aiAnswerSelector: '.prose-custom'
  },
  sourcesExtraction: {
    selectors: [{
      selector: 'span[role="link"].text-pacific',
      extractionType: 'list',
      scope: 'content'
    }]
  }
};
```

### Gemini 分析

**已分析 HTML 樣本**：`gemini-normal-1.html`, `gemini-canvas-1.html`

**平台特性**：
- 框架：Angular（使用 `ng-*` 類別與 `_ngcontent-*` 屬性）
- URL 結構：`gemini.google.com/app/{conversation_id}` 或 `gemini.google.com/u/{user_id}/app/{id}`

**DOM 結構發現**：

| 元素 | 選擇器 | 說明 |
|------|--------|------|
| 主應用容器 | `chat-app#app-root` | Angular 應用根元素 |
| 聊天容器 | `[data-test-id="chat-app"]` | 聊天區域 |
| 對話容器 | `.conversation-container` | 單一對話輪次 |
| 使用者訊息 | `.user-query-container` | 使用者問題容器 |
| 使用者文字 | `.query-text.gds-body-l` | 使用者問題文字 |
| AI 回應 | `.model-response-text` | Gemini 回應內容 |
| 回應頁尾 | `.response-footer` | 回應操作區 |
| 程式碼區塊 | `[data-test-id="code-content"]` | 程式碼區塊 |
| 對話歷史 | `[data-test-id="conversation"]` | 側邊對話列表項目 |

**Angular 特性**：
- 使用 `_ngcontent-ng-c*` 屬性
- 類別名稱含 `ng-tns-c*-*` 
- 動態內容標記：`.ng-star-inserted`
- 需要等待 Angular 渲染完成

**提取設定建議**：

```typescript
export const geminiConfig: ExtractionConfig = {
  domainName: 'Gemini',
  allowedUrls: ['gemini.google.com/app', 'gemini.google.com/u/'],
  pageTitle: { 
    selector: 'title',
    fallbackSelectors: ['[data-test-id="conversation-title"]']
  },
  contentSelector: '.conversation-container',
  extractionType: 'message-list',
  messageConfig: {
    userSelector: '.user-query-container',
    assistantSelector: '.model-response-text',
    contentSelector: '.query-text, .model-response-text',
    roles: {
      user: '使用者',
      assistant: 'Gemini'
    }
  }
};
```

**Canvas 模式差異**（`gemini-canvas-1.html`）：
- Canvas 是 Gemini 的程式碼編輯/預覽模式
- 包含額外元素：`[data-test-id="web-preview"]`, `[data-test-id="toolbar"]`
- 回應結構可能較複雜：`.response-container-has-multiple-responses`
- 基本提取邏輯相同，Canvas 內容需要特殊處理

**驗證狀態**：
- [x] 分析對話 DOM 結構 ✅
- [x] 確認訊息角色標記方式 ✅ （user-query-container vs model-response-text）
- [ ] 測試 Content Script 注入（Angular 應用可能需要特殊處理）

---

## 10. 測試策略

### Decision: Vitest + Playwright

### Unit Tests (Vitest)

```typescript
// packages/html-to-markdown/tests/converter.test.ts
describe('htmlToMarkdown', () => {
  it('should convert headings correctly', () => {
    expect(htmlToMarkdown('<h1>Title</h1>')).toBe('# Title\n\n');
  });
  
  it('should preserve code blocks with language', () => {
    const html = '<pre><code class="language-typescript">const x = 1;</code></pre>';
    expect(htmlToMarkdown(html)).toContain('```typescript');
  });
});
```

### Integration Tests

```typescript
// tests/integration/extraction.test.ts
describe('ChatGPT Extraction', () => {
  it('should extract messages from ChatGPT HTML', async () => {
    const html = loadFixture('chatgpt-conversation.html');
    const result = await extractContent(html, chatgptConfig);
    
    expect(result.sections).toHaveLength(4);
    expect(result.sections[0].role).toBe('使用者');
    expect(result.sections[1].role).toBe('ChatGPT');
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/export.spec.ts
test('should export ChatGPT conversation', async ({ page, context }) => {
  // 載入擴充功能
  // 模擬 ChatGPT 頁面
  // 點擊匯出
  // 驗證下載的檔案內容
});
```

---

## 結論

所有技術選擇已完成研究，無未解決的 NEEDS CLARIFICATION 項目。核心決策：

1. ✅ 自行實作 HTML 轉 Markdown（基於 SaveMyPhind）
2. ✅ Turborepo + pnpm + Vite 建置系統
3. ✅ React + shadcn/ui + Tailwind CSS v4 UI 框架
4. ✅ 設定驅動的平台提取策略
5. ✅ JSZip 處理多檔案匯出
6. ✅ webextension-polyfill 跨瀏覽器支援
7. ✅ 策略模式實作可擴展輸出目的地
8. ✅ chrome.storage.sync 儲存使用者設定
9. ⏳ deepwiki/Gemini 平台選擇器待實作時分析
10. ✅ Vitest + Playwright 測試策略

