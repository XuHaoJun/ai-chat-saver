# Quickstart: AI Chat Conversation Exporter

**Branch**: `001-ai-chat-exporter` | **Date**: 2025-01-27

## 快速開始指南

本文件說明如何設定開發環境並開始開發 AI Chat Saver 擴充功能。

---

## 前置需求

- **Node.js**: 20.x 或更高版本
- **pnpm**: 8.x 或更高版本（`npm install -g pnpm`）
- **瀏覽器**: Chrome 或 Firefox（用於測試）
- **編輯器**: 建議使用 VS Code 或 Cursor

---

## 初始設定

### 1. 複製專案

```bash
cd /home/noah/Desktop/ai-chat-saver
```

### 2. 安裝依賴

```bash
# 安裝所有工作區依賴
pnpm install
```

### 3. 建置所有套件

```bash
# 建置 monorepo 中的所有套件
pnpm build
```

---

## 專案結構

```text
ai-chat-saver/
├── apps/
│   └── extension/          # 瀏覽器擴充功能
├── packages/
│   ├── html-to-markdown/   # HTML 轉 Markdown 轉換器
│   ├── extraction-configs/ # 平台提取設定
│   └── shared-types/       # 共享型別
├── tests/                  # 測試檔案
├── scripts/                # 建置腳本
├── turbo.json              # Turborepo 設定
└── pnpm-workspace.yaml     # pnpm 工作區設定
```

---

## 開發指令

### 開發模式（監視模式）

```bash
# 同時啟動所有套件的開發模式
pnpm dev

# 僅開發 Chrome 擴充功能
pnpm dev:chrome

# 僅開發 Firefox 擴充功能
pnpm dev:firefox
```

### 建置

```bash
# 建置所有套件
pnpm build

# 建置 Chrome 版本
pnpm build:chrome

# 建置 Firefox 版本
pnpm build:firefox

# 建置生產版本（含 ZIP）
pnpm prod
```

### 測試

```bash
# 執行所有測試
pnpm test

# 執行單元測試
pnpm test:unit

# 執行整合測試
pnpm test:integration

# 監視模式測試
pnpm test:watch
```

### 程式碼品質

```bash
# 執行 linter
pnpm lint

# 修正 linter 錯誤
pnpm lint:fix

# 型別檢查
pnpm typecheck

# 格式化程式碼
pnpm format
```

---

## 在瀏覽器載入擴充功能

### Chrome

1. 開啟 Chrome，前往 `chrome://extensions/`
2. 啟用「開發人員模式」（右上角）
3. 點擊「載入未封裝項目」
4. 選擇 `apps/extension/dist/chrome` 資料夾

### Firefox

1. 開啟 Firefox，前往 `about:debugging#/runtime/this-firefox`
2. 點擊「載入暫用附加元件...」
3. 選擇 `apps/extension/dist/firefox/manifest.json`

---

## 開發工作流程

### 新增平台支援

1. 在 `packages/extraction-configs/src/platforms/` 新增平台設定檔

```typescript
// packages/extraction-configs/src/platforms/newplatform.ts
import type { ExtractionConfig } from '../types';

export const newplatformConfig: ExtractionConfig = {
  domainName: 'New Platform',
  allowedUrls: ['newplatform.com/chat'],
  pageTitle: { selector: 'h1' },
  contentSelector: '.chat-container',
  extractionType: 'message-list',
  messageConfig: {
    roleSelector: '[data-role]',
    roleAttribute: 'data-role',
    roles: {
      user: '使用者',
      assistant: 'AI',
    },
  },
};
```

2. 在 `packages/extraction-configs/src/index.ts` 註冊新平台

```typescript
export * from './platforms/newplatform';
```

3. 在 `packages/extraction-configs/src/allowed-pages.ts` 新增 URL 規則

```typescript
export const EXTRACTION_ALLOWED_PAGES = {
  // ...existing
  NewPlatform: 'newplatform.com/chat',
};
```

4. 更新擴充功能的 `manifest.json` 權限

### 修改 HTML 轉 Markdown 規則

1. 在 `packages/html-to-markdown/src/rules/` 新增或修改規則

```typescript
// packages/html-to-markdown/src/rules/newrule.ts
export function convertNewElement(html: string): string {
  return html.replace(/<newelement[^>]*>(.*?)<\/newelement>/gi, '**$1**');
}
```

2. 在 `packages/html-to-markdown/src/converter.ts` 套用規則

3. 新增測試案例

```typescript
// packages/html-to-markdown/tests/converter.test.ts
it('should convert new element correctly', () => {
  expect(htmlToMarkdown('<newelement>test</newelement>')).toBe('**test**');
});
```

### 新增輸出目的地（未來擴展）

1. 實作 `OutputDestination` 介面

```typescript
// apps/extension/src/output/destinations/cloud.ts
import type { OutputDestination, ExportContent, ExportOptions, ExportResult } from '@/types/output';

export class CloudDestination implements OutputDestination {
  readonly name = 'cloud-storage';
  enabled = false;

  async export(content: ExportContent, options: ExportOptions): Promise<ExportResult> {
    // 實作雲端上傳邏輯
    return { success: true, destination: this.name };
  }
}
```

2. 在 `OutputManager` 註冊新目的地

---

## 設定檔說明

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 根 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

---

## 常見問題

### Q: 建置失敗，顯示套件找不到

A: 確保先建置依賴套件：

```bash
pnpm build --filter=@ai-chat-saver/shared-types
pnpm build --filter=@ai-chat-saver/html-to-markdown
pnpm build
```

### Q: 擴充功能載入後圖示沒有反應

A: 檢查以下項目：

1. 確認在支援的平台頁面上（ChatGPT、Claude 等）
2. 檢查瀏覽器主控台是否有錯誤訊息
3. 確認 Content Script 已正確注入

### Q: TypeScript 型別錯誤

A: 執行型別檢查並確認所有套件已建置：

```bash
pnpm typecheck
```

### Q: Tailwind CSS 樣式沒有套用

A: 確認 `tailwind.config.ts` 的 `content` 設定正確：

```typescript
// apps/extension/tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}', '../../packages/*/src/**/*.{ts,tsx}'],
  // ...
};
```

---

## 相關資源

- [Turborepo 文件](https://turbo.build/repo/docs)
- [Vite 文件](https://vitejs.dev/)
- [Chrome Extensions 開發指南](https://developer.chrome.com/docs/extensions/)
- [Firefox Add-ons 開發指南](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [shadcn/ui 元件庫](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
