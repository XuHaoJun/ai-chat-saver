# HTML 測試樣本

本目錄包含從各 AI 聊天平台下載的 HTML 範例，用於開發和測試提取邏輯。

## 檔案清單

| 檔案名稱                 | 平台     | 類型        | 說明                                             |
| ------------------------ | -------- | ----------- | ------------------------------------------------ |
| `deepwiki-normal-1.html` | deepwiki | 搜尋問答    | deepwiki 平台的標準搜尋結果頁面                  |
| `gemini-normal-1.html`   | Gemini   | 一般對話    | Google Gemini 的標準對話頁面（多輪對話）         |
| `gemini-canvas-1.html`   | Gemini   | Canvas 對話 | Google Gemini 的 Canvas 模式對話（含程式碼編輯） |

## deepwiki DOM 結構分析

**平台特性**：

- 框架：Next.js（React Server Components）
- URL 結構：`deepwiki.com/search/{slug}`
- 用途：GitHub 專案文件搜尋/問答

### 關鍵選擇器

| 元素       | 選擇器                                  | 說明                       |
| ---------- | --------------------------------------- | -------------------------- |
| 問答區塊   | `[data-query-index]`                    | 每個問答對有唯一索引       |
| 問答顯示   | `[data-query-display="true"]`           | 顯示中的問答區塊           |
| 問題標題   | `.text-xl, .text-2xl`                   | 使用者問題                 |
| 回答內容   | `.prose-custom`                         | AI 回答（Markdown 渲染後） |
| 來源引用   | `span[role="link"].text-pacific`        | 程式碼來源參考             |
| 程式碼區塊 | `.react-syntax-highlighter-line-number` | 程式碼高亮                 |

### 提取類型建議

`search-sections` - 問答形式，每個 `data-query-index` 為一個區塊

## Gemini DOM 結構分析

**平台特性**：

- 框架：Angular
- URL 結構：`gemini.google.com/app/{id}` 或 `gemini.google.com/u/{user}/app/{id}`

### 關鍵選擇器

| 元素       | 選擇器                          | 說明               |
| ---------- | ------------------------------- | ------------------ |
| 主應用容器 | `chat-app#app-root`             | Angular 應用根元素 |
| 聊天容器   | `[data-test-id="chat-app"]`     | 聊天區域           |
| 對話容器   | `.conversation-container`       | 單一對話輪次       |
| 使用者訊息 | `.user-query-container`         | 使用者問題容器     |
| 使用者文字 | `.query-text.gds-body-l`        | 使用者問題文字     |
| AI 回應    | `.model-response-text`          | Gemini 回應內容    |
| 程式碼區塊 | `[data-test-id="code-content"]` | 程式碼區塊         |

### Angular 特性

- 動態內容標記：`.ng-star-inserted`
- 元件屬性：`_ngcontent-ng-c*`
- 需要等待 Angular 渲染完成

### 提取類型建議

`message-list` - 對話形式，`.user-query-container` 與 `.model-response-text` 交替

### Canvas 模式差異

`gemini-canvas-1.html` 包含 Gemini Canvas 功能：

- 程式碼編輯預覽：`[data-test-id="web-preview"]`
- 工具列：`[data-test-id="toolbar"]`
- 多回應容器：`.response-container-has-multiple-responses`

## 使用方式

### 單元測試

```typescript
import { readFileSync } from 'fs';
import { htmlToMarkdown } from '@ai-chat-saver/html-to-markdown';

const deepwikiHtml = readFileSync('./tests/fixtures/html-samples/deepwiki-normal-1.html', 'utf-8');
const result = htmlToMarkdown(deepwikiHtml);
```

### 整合測試

```typescript
import { extractContent } from '../src/content/extractors';
import { deepwikiConfig } from '@ai-chat-saver/extraction-configs';

const html = loadFixture('deepwiki-normal-1.html');
const result = await extractContent(html, deepwikiConfig);
```

## 新增測試樣本

1. 從目標平台下載完整 HTML（瀏覽器「儲存網頁」或開發者工具）
2. 將檔案命名為 `{platform}-{type}-{number}.html`
   - 例如：`chatgpt-normal-1.html`, `claude-artifacts-1.html`
3. 更新此 README 的檔案清單與 DOM 結構分析
4. 在 `research.md` 記錄提取設定建議

## 注意事項

- HTML 檔案可能包含個人資訊，請確保不提交敏感資料
- 平台 UI 經常更新，樣本可能過時
- 建議定期更新測試樣本以確保相容性