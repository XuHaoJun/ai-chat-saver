# Implementation Plan: AI Chat Conversation Exporter Extension

**Branch**: `001-ai-chat-exporter` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chat-exporter/spec.md`

## Summary

開發跨瀏覽器（Chrome/Firefox）擴充功能，支援從 ChatGPT、Claude、Perplexity、deepwiki、Gemini、Phind 匯出對話為 Markdown 檔案。採用 Turborepo monorepo 架構，將 HTML 轉 Markdown 轉換器獨立為可重用套件。設計可擴展的輸出層，未來支援雲端上傳功能。

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: React 18, shadcn/ui, Tailwind CSS v3, webextension-polyfill  
**Build System**: Turborepo monorepo, Vite for bundling  
**Storage**: Browser extension storage API (chrome.storage.sync)  
**Testing**: Vitest for unit/integration tests, Playwright for E2E  
**Target Platform**: Chrome (Manifest V3), Firefox (Manifest V2/3)  
**Project Type**: Monorepo with browser extension + shared packages  
**Performance Goals**: Export 100 messages within 3 seconds, support up to 1000 messages  
**Constraints**: < 5MB extension package size, offline-capable for exports  
**Scale/Scope**: 6 supported platforms, 2 browser targets

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle       | Status  | Notes                                                          |
| --------------- | ------- | -------------------------------------------------------------- |
| I. MVP          | ✅ PASS | P1 (基本匯出) 可獨立交付；P2/P3 功能明確區分                   |
| II. 可測試性    | ✅ PASS | 每個平台提取器可獨立測試；轉換器套件有單元測試                 |
| III. 高品質標準 | ✅ PASS | 使用 TypeScript 確保型別安全；ESLint + Prettier 統一程式碼風格 |
| IV. 簡約設計    | ✅ PASS | 採用已驗證的 SaveMyPhind 模式；避免過早抽象雲端功能            |
| V. 正體中文     | ✅ PASS | 所有文件、註解、UI 文字使用正體中文                            |

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chat-exporter/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
ai-chat-saver/
├── apps/
│   └── extension/                    # 瀏覽器擴充功能主應用
│       ├── src/
│       │   ├── background/           # Service Worker / Background Script
│       │   │   ├── index.ts          # 背景腳本入口
│       │   │   ├── scraping.ts       # 提取流程控制
│       │   │   └── output.ts         # 輸出處理（下載/未來雲端）
│       │   ├── content/              # Content Script
│       │   │   ├── index.ts          # 內容腳本入口
│       │   │   └── extractors/       # 平台提取器
│       │   │       ├── base.ts       # 基礎提取器介面
│       │   │       ├── chatgpt.ts    # ChatGPT 提取器
│       │   │       ├── claude.ts     # Claude 提取器
│       │   │       ├── perplexity.ts # Perplexity 提取器
│       │   │       ├── phind.ts      # Phind 提取器
│       │   │       ├── deepwiki.ts   # deepwiki 提取器
│       │   │       ├── gemini.ts     # Gemini 提取器
│       │   │       └── index.ts      # 提取器註冊表
│       │   ├── options/              # 設定頁面（React + shadcn）
│       │   │   ├── App.tsx           # 設定頁面主元件
│       │   │   ├── main.tsx          # React 入口
│       │   │   └── components/       # UI 元件
│       │   ├── popup/                # 彈出視窗（可選，未來擴展）
│       │   ├── types/                # TypeScript 型別定義
│       │   │   ├── extraction.ts     # 提取相關型別
│       │   │   ├── config.ts         # 設定相關型別
│       │   │   └── output.ts         # 輸出相關型別
│       │   └── utils/                # 工具函數
│       │       ├── storage.ts        # 儲存 API 封裝
│       │       ├── filename.ts       # 檔名格式化
│       │       └── platform.ts       # 平台偵測
│       ├── public/
│       │   └── icons/                # 擴充功能圖示
│       ├── manifest.json             # 擴充功能清單（模板）
│       ├── vite.config.ts            # Vite 建置設定
│       ├── tailwind.config.ts        # Tailwind CSS v3 設定
│       └── package.json
│
├── packages/
│   ├── html-to-markdown/             # HTML 轉 Markdown 轉換器套件
│   │   ├── src/
│   │   │   ├── index.ts              # 套件入口
│   │   │   ├── converter.ts          # 主要轉換邏輯
│   │   │   ├── rules/                # 轉換規則
│   │   │   │   ├── headings.ts       # 標題轉換
│   │   │   │   ├── code.ts           # 程式碼區塊轉換
│   │   │   │   ├── lists.ts          # 列表轉換
│   │   │   │   ├── tables.ts         # 表格轉換
│   │   │   │   ├── links.ts          # 連結/圖片轉換
│   │   │   │   └── text.ts           # 文字格式轉換
│   │   │   ├── entities.ts           # HTML 實體解碼
│   │   │   └── types.ts              # 型別定義
│   │   ├── tests/
│   │   │   └── converter.test.ts     # 轉換器測試
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── extraction-configs/           # 平台提取設定套件
│   │   ├── src/
│   │   │   ├── index.ts              # 設定入口
│   │   │   ├── types.ts              # 設定型別
│   │   │   ├── platforms/            # 各平台設定
│   │   │   │   ├── chatgpt.ts
│   │   │   │   ├── claude.ts
│   │   │   │   ├── perplexity.ts
│   │   │   │   ├── phind.ts
│   │   │   │   ├── deepwiki.ts
│   │   │   │   └── gemini.ts
│   │   │   └── allowed-pages.ts      # 允許提取的頁面清單
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── shared-types/                 # 共享型別套件
│       ├── src/
│       │   ├── index.ts
│       │   ├── conversation.ts       # 對話型別
│       │   ├── message.ts            # 訊息型別
│       │   └── config.ts             # 設定型別
│       └── package.json
│
├── tests/
│   ├── integration/                  # 整合測試
│   │   ├── extraction.test.ts        # 提取流程測試
│   │   └── export.test.ts            # 匯出流程測試
│   └── e2e/                          # 端對端測試
│       └── playwright.config.ts
│
├── scripts/
│   ├── build.ts                      # 建置腳本
│   ├── manifest-generator.ts         # 清單產生器（Chrome/Firefox）
│   └── zip.ts                        # 打包腳本
│
├── turbo.json                        # Turborepo 設定
├── package.json                      # 根 package.json
├── pnpm-workspace.yaml               # pnpm 工作區設定
└── tsconfig.json                     # 根 TypeScript 設定
```

**Structure Decision**: 採用 Turborepo monorepo 架構，將 `html-to-markdown` 轉換器與 `extraction-configs` 平台設定獨立為可重用套件。此設計：

1. 符合使用者需求：轉換器作為獨立套件
2. 便於未來擴展：新增平台只需在 `extraction-configs` 新增設定
3. 支援測試隔離：各套件可獨立測試
4. 學習自 SaveMyPhind：採用類似的分層架構與設定驅動模式

## Architecture Overview

### 輸出層設計（可擴展架構）

```text
┌─────────────────────────────────────────────────────────────┐
│                     Output Manager                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  OutputDestination (介面)                            │   │
│  │  - export(content, options): Promise<ExportResult>   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ▲                                  │
│          ┌───────────────┼───────────────┐                 │
│          │               │               │                 │
│  ┌───────▼──────┐ ┌─────▼─────┐ ┌───────▼──────┐         │
│  │ LocalDownload│ │  Webhook  │ │ CloudUpload  │         │
│  │ (現在實作)   │ │ (現在實作)│ │ (未來擴展)   │         │
│  └──────────────┘ └───────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 多檔案匯出與壓縮

當匯出包含媒體檔案時，自動產生 ZIP 檔案：

```text
export-2025-01-27.zip
├── conversation.md          # 主要 Markdown 檔案
└── assets/                   # 媒體檔案資料夾
    ├── image-001.png
    ├── image-002.jpg
    └── ...
```

### 提取流程（學習自 SaveMyPhind）

```text
1. 使用者點擊擴充功能圖示
       │
       ▼
2. Background Script 偵測目前頁面
       │
       ▼
3. 載入對應平台的提取設定
       │
       ▼
4. 透過 Content Script 執行 DOM 提取
       │
       ▼
5. 將 HTML 轉換為結構化資料
       │
       ▼
6. 使用 html-to-markdown 套件轉換
       │
       ▼
7. 格式化輸出內容（含 metadata）
       │
       ▼
8. 透過 Output Manager 匯出
   ├── 單一檔案 → 直接下載 .md
   └── 多檔案 → 壓縮為 .zip 後下載
```

## Key Implementation Decisions

### 1. 採用設定驅動的提取模式

學習 SaveMyPhind 的 `extractionConfigs` 模式，每個平台的 DOM 選擇器與提取邏輯集中管理：

```typescript
// packages/extraction-configs/src/platforms/chatgpt.ts
export const chatgptConfig: ExtractionConfig = {
  domainName: 'ChatGPT',
  allowedUrls: ['chatgpt.com/c', 'chatgpt.com/share'],
  pageTitle: { selector: 'h1' },
  contentSelector: 'main article',
  extractionType: 'message-list',
  messageConfig: {
    roleSelector: '[data-message-author-role]',
    roleAttribute: 'data-message-author-role',
    roles: { assistant: 'ChatGPT', user: '使用者' },
  },
};
```

### 2. 支援 Manifest V2/V3 雙版本

Chrome 使用 Manifest V3（Service Worker），Firefox 使用 Manifest V2（Background Script）。透過建置腳本自動產生對應版本：

```typescript
// scripts/manifest-generator.ts
export function generateManifest(browser: 'chrome' | 'firefox'): Manifest {
  const base = {
    /* 共用設定 */
  };
  return browser === 'chrome'
    ? { ...base, manifest_version: 3, background: { service_worker: '...' } }
    : { ...base, manifest_version: 2, background: { scripts: ['...'] } };
}
```

### 3. 可擴展的輸出目的地

設計 `OutputDestination` 介面，現在實作本地下載，未來可擴展至雲端：

```typescript
// apps/extension/src/types/output.ts
interface OutputDestination {
  readonly name: string;
  readonly enabled: boolean;
  export(content: ExportContent, options: ExportOptions): Promise<ExportResult>;
}

// 現在實作
class LocalDownloadDestination implements OutputDestination {
  /* ... */
}
class WebhookDestination implements OutputDestination {
  /* ... */
}

// 未來擴展
// class GoogleDriveDestination implements OutputDestination { /* ... */ }
// class NotionDestination implements OutputDestination { /* ... */ }
```

## Complexity Tracking

> 無需填寫：所有設計符合簡約原則，無違反 Constitution 的決策。

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |
