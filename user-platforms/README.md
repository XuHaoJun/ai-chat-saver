# User Platforms

本目錄用於新增自定義 AI 聊天平台支援。只需提供最小設定和 HTML 樣本，系統會自動偵測提取選擇器。

## 快速開始

### 1. 建立平台目錄

```bash
mkdir -p user-platforms/my-platform/samples
```

### 2. 建立 platform.json

只需 4 個必要欄位：

```json
{
  "id": "my-platform",
  "name": "My Platform",
  "domain": "my-platform.ai",
  "urlPatterns": ["my-platform.ai/chat/", "my-platform.ai/conversation/"]
}
```

### 3. 新增 HTML 樣本

從目標平台儲存完整 HTML 頁面到 `samples/` 目錄：

```bash
# 在瀏覽器中：右鍵 → 另存網頁 → 完整網頁
# 或使用開發者工具複製 HTML
```

### 4. 完成！

系統會自動分析 HTML 樣本並偵測：
- 提取類型（message-list 或 search-sections）
- 標題選擇器
- 內容容器
- 訊息/區塊選擇器

## 目錄結構

```
user-platforms/
├── my-platform/
│   ├── platform.json          # 平台設定（必要）
│   └── samples/               # HTML 樣本（建議）
│       ├── conversation-1.html
│       └── conversation-2.html
├── another-platform/
│   ├── platform.json
│   └── samples/
│       └── ...
└── README.md
```

## platform.json 完整格式

### 必要欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 平台唯一識別碼（小寫，無空格） |
| `name` | string | 平台顯示名稱 |
| `domain` | string | 主要網域名稱 |
| `urlPatterns` | string[] | URL 匹配模式（會匹配包含這些字串的 URL） |

### 可選欄位（自動偵測）

以下欄位可由 DOM 分析器自動偵測，但也可手動指定覆蓋：

```json
{
  "id": "my-platform",
  "name": "My Platform",
  "domain": "my-platform.ai",
  "urlPatterns": ["my-platform.ai/chat/"],

  "extractionType": "message-list",

  "pageTitle": {
    "selector": "h1.chat-title",
    "fallbackSelectors": ["title", ".conversation-title"]
  },

  "contentSelector": "main.chat-container",

  "messageConfig": {
    "roleSelector": "[data-role]",
    "roleAttribute": "data-role",
    "contentSelector": ".message-content",
    "userSelector": "[data-role='user']",
    "assistantSelector": "[data-role='assistant']",
    "roles": {
      "user": "You",
      "assistant": "AI"
    }
  },

  "sectionConfig": {
    "userQuestionSelector": ".query-text",
    "aiAnswerSelector": ".answer-text"
  },

  "version": "1.0.0",
  "author": "Your Name",
  "description": "Support for My Platform"
}
```

### 提取類型

| 類型 | 說明 | 適用平台 |
|------|------|----------|
| `message-list` | 訊息列表（使用者/AI 交替） | ChatGPT, Claude, Gemini |
| `search-sections` | 問答區塊（問題 + 回答） | Perplexity, Phind, deepwiki |

## 範例：DeepSeek

```json
{
  "id": "deepseek",
  "name": "DeepSeek",
  "domain": "chat.deepseek.com",
  "urlPatterns": ["chat.deepseek.com/"]
}
```

## 範例：Perplexity

```json
{
  "id": "perplexity",
  "name": "Perplexity",
  "domain": "perplexity.ai",
  "urlPatterns": ["perplexity.ai/search/", "perplexity.ai/page/"]
}
```

## 自動偵測原理

DOM 分析器會在 HTML 樣本中尋找以下模式：

### 訊息列表偵測
- 角色屬性：`data-message-author-role`, `data-role`, `data-author`
- 使用者選擇器：`[data-role="user"]`, `.user-message`, `.human-message`
- AI 選擇器：`[data-role="assistant"]`, `.assistant-message`, `.ai-message`
- 內容選擇器：`.markdown`, `.prose`, `.message-content`

### 搜尋區塊偵測
- 區塊容器：`[data-query-index]`, `.search-result`, `.qa-section`
- 問題選擇器：`.query-text`, `[class*="query"]`, `h1`
- 回答選擇器：`.answer-text`, `.prose`, `.markdown-content`

## 測試設定

使用 CLI 工具測試平台設定：

```bash
# 分析 HTML 樣本
pnpm analyze-platform deepseek

# 驗證 platform.json
pnpm validate-platform deepseek
```

## 貢獻平台設定

如果你為某個平台建立了設定，歡迎提交 PR！

1. 確保 `platform.json` 格式正確
2. 提供至少一個 HTML 樣本（移除敏感資訊）
3. 在 PR 描述中說明平台特性

## 注意事項

- HTML 樣本可能包含個人資訊，請確保不提交敏感資料
- 平台 UI 經常更新，建議定期更新 HTML 樣本
- 如果自動偵測不準確，可手動指定選擇器覆蓋
