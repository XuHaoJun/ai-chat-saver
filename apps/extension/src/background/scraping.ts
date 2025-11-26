/**
 * 提取流程控制
 *
 * @module extension/background/scraping
 */

import browser from 'webextension-polyfill';
import type { Platform } from '@ai-chat-saver/shared-types';
import { getConfigForPlatform } from '@ai-chat-saver/extraction-configs';
import { htmlToMarkdown } from '@ai-chat-saver/html-to-markdown';
import type { ExtractedContent, ExtractedSection } from '@/types/extraction';
import type { ExportContent, ExportMetadata } from '@/types/output';
import { getStorage } from '@/utils/storage';
import { formatFilename } from '@/utils/filename';

/**
 * 提取流程結果
 */
export interface ScrapingResult {
  success: boolean;
  content?: ExportContent;
  filename?: string;
  error?: string;
}

/**
 * 確保 content script 已注入
 */
async function ensureContentScriptLoaded(tabId: number): Promise<boolean> {
  console.log('[AI Chat Saver] Checking content script on tab:', tabId);

  try {
    // 首先嘗試 ping content script
    console.log('[AI Chat Saver] Pinging content script...');
    const response = await browser.tabs.sendMessage(tabId, { type: 'PING' });
    if (response?.loaded === true) {
      console.log('[AI Chat Saver] Content script ping successful');
      return true;
    }
    console.log('[AI Chat Saver] Content script ping failed, response:', response);
  } catch (error) {
    console.log('[AI Chat Saver] Content script ping threw error:', error);
  }

  // 檢查頁面是否已有 content script 標記
  try {
    console.log('[AI Chat Saver] Checking for content script attribute...');
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: () => document.documentElement.hasAttribute('data-ai-chat-saver-loaded'),
    });

    if (results && results[0] && results[0].result === true) {
      console.log('[AI Chat Saver] Content script attribute found');
      // Content script 已經載入但 ping 失敗，可能是訊息處理問題
      return true;
    }
    console.log('[AI Chat Saver] Content script attribute not found, results:', results);
  } catch (error) {
    console.log('[AI Chat Saver] Error checking content script attribute:', error);
  }

  // 手動注入 content script
  try {
    console.log('[AI Chat Saver] Manually injecting content script...');
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });

    // 等待一下讓 script 初始化
    await new Promise(resolve => setTimeout(resolve, 100));

    // 再次確認 script 已載入
    console.log('[AI Chat Saver] Verifying content script after injection...');
    const response = await browser.tabs.sendMessage(tabId, { type: 'PING' });
    const success = response?.loaded === true;
    console.log('[AI Chat Saver] Content script injection result:', success, response);
    return success;
  } catch (error) {
    console.error('[AI Chat Saver] Content script injection failed:', error);
    return false;
  }
}

/**
 * 從頁面提取內容
 */
async function extractFromPage(tabId: number, platform: Platform): Promise<ExtractedContent> {
  console.log('[AI Chat Saver] Extracting content from platform:', platform, 'tab:', tabId);

  const config = getConfigForPlatform(platform);
  console.log('[AI Chat Saver] Using config:', config);

  // Use scripting.executeScript to run extraction directly - more reliable than messaging
  console.log('[AI Chat Saver] Executing extraction script directly...');
  try {
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: (platformArg: string, configArg: any) => {
        // This function runs in the page context
        console.log('[AI Chat Saver] Direct extraction starting for platform:', platformArg);
        
        // Access the extraction function from the content script's global scope
        // Since content script is already loaded, we can trigger extraction via DOM
        const event = new CustomEvent('ai-chat-saver-extract', {
          detail: { platform: platformArg, config: configArg }
        });
        document.dispatchEvent(event);
        
        // Wait a bit and read result from DOM
        return new Promise((resolve) => {
          // Listen for result
          const handler = (e: Event) => {
            const customEvent = e as CustomEvent;
            console.log('[AI Chat Saver] Received extraction result via event');
            document.removeEventListener('ai-chat-saver-result', handler);
            resolve(customEvent.detail);
          };
          document.addEventListener('ai-chat-saver-result', handler);
          
          // Timeout fallback
          setTimeout(() => {
            document.removeEventListener('ai-chat-saver-result', handler);
            // Try to read from DOM element
            const resultEl = document.getElementById('ai-chat-saver-result');
            if (resultEl && resultEl.textContent) {
              try {
                resolve(JSON.parse(resultEl.textContent));
                return;
              } catch (e) {
                console.error('[AI Chat Saver] Failed to parse result:', e);
              }
            }
            resolve({ success: false, error: '提取超時' });
          }, 5000);
        });
      },
      args: [platform, config],
    });

    console.log('[AI Chat Saver] Direct execution results:', results);

    if (results && results[0] && results[0].result) {
      const result = results[0].result as ExtractedContent;
      console.log('[AI Chat Saver] Extraction successful:', result);
      return result;
    }

    return {
      success: false,
      error: '提取腳本執行失敗',
    };
  } catch (error) {
    console.error('[AI Chat Saver] Direct extraction failed:', error);
    return {
      success: false,
      error: '無法執行提取腳本',
    };
  }
}

/**
 * 將提取內容轉換為 Markdown
 */
function formatToMarkdown(
  sections: ExtractedSection[],
  title: string,
  platform: string,
  url: string,
  includeMetadata: boolean
): string {
  const lines: string[] = [];

  // 新增 metadata 標頭
  if (includeMetadata) {
    lines.push('---');
    lines.push(`title: "${title}"`);
    lines.push(`platform: ${platform}`);
    lines.push(`url: ${url}`);
    lines.push(`exported: ${new Date().toISOString()}`);
    lines.push('---');
    lines.push('');
  }

  // 新增標題
  lines.push(`# ${title}`);
  lines.push('');

  // 轉換各區塊
  for (const section of sections) {
    if (section.type === 'message') {
      lines.push(`## ${section.role}`);
      lines.push('');
      lines.push(htmlToMarkdown(section.content));
      lines.push('');

      // 新增來源
      if (section.sources && section.sources.length > 0) {
        lines.push('**來源:**');
        section.sources.forEach((source, i) => {
          lines.push(`${i + 1}. [${source.title}](${source.url})`);
        });
        lines.push('');
      }
    } else if (section.type === 'search-qa') {
      if (section.question) {
        lines.push('## 問題');
        lines.push('');
        lines.push(section.question);
        lines.push('');
      }

      if (section.answer) {
        lines.push('## 回答');
        if (section.model) {
          lines.push(`*使用模型: ${section.model}*`);
        }
        lines.push('');
        lines.push(htmlToMarkdown(section.answer));
        lines.push('');
      }

      // 新增來源
      if (section.sources && section.sources.length > 0) {
        lines.push('### 來源');
        section.sources.forEach((source, i) => {
          lines.push(`${i + 1}. [${source.title}](${source.url})`);
        });
        lines.push('');
      }
    } else if (section.type === 'article') {
      lines.push(htmlToMarkdown(section.content));
      lines.push('');
    } else if (section.type === 'generic') {
      lines.push(htmlToMarkdown(section.html));
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * 進度回呼函數類型
 */
export type ProgressCallback = (step: number, description: string) => void;

/**
 * 執行提取流程
 */
export async function launchScraping(
  tabId: number,
  platform: Platform,
  url: string,
  onProgress?: ProgressCallback
): Promise<ScrapingResult> {
  try {
    // 步驟 1: 確保 content script 已載入
    onProgress?.(1, '載入提取腳本...');
    const loaded = await ensureContentScriptLoaded(tabId);
    if (!loaded) {
      return {
        success: false,
        error: '無法載入提取腳本',
      };
    }

    // 步驟 2: 執行提取
    onProgress?.(2, '提取對話內容...');
    const extractedContent = await extractFromPage(tabId, platform);

    if (!extractedContent.success || !extractedContent.data) {
      return {
        success: false,
        error: extractedContent.error || '提取失敗',
      };
    }

    // 步驟 3: 格式化為 Markdown
    onProgress?.(3, '轉換為 Markdown...');
    // 取得使用者設定
    const storage = await getStorage();
    const { filenameTemplate, includeMetadata } = storage;

    // 取得平台設定
    const config = getConfigForPlatform(platform);

    // 格式化為 Markdown
    const markdown = formatToMarkdown(
      extractedContent.data.sections,
      extractedContent.data.title,
      config.domainName,
      url,
      includeMetadata
    );

    // 計算訊息數量
    const messageCount = extractedContent.data.sections.filter(
      (s) => s.type === 'message' || s.type === 'search-qa'
    ).length;

    // 建立匯出 metadata
    const metadata: ExportMetadata = {
      platform: config.domainName,
      title: extractedContent.data.title,
      sourceUrl: url,
      exportedAt: new Date(),
      messageCount,
    };

    // 格式化檔名
    const filename = formatFilename(filenameTemplate, {
      title: extractedContent.data.title,
      platform: config.domainName,
      hostname: new URL(url).hostname,
    });

    // 建立匯出內容
    const exportContent: ExportContent = {
      markdown,
      assets: [], // 目前不處理媒體資產
      metadata,
    };

    // 步驟 4: 準備匯出
    onProgress?.(4, '準備下載...');

    return {
      success: true,
      content: exportContent,
      filename,
    };
  } catch (error) {
    // 記錄詳細錯誤以供除錯
    console.error('提取錯誤:', error);

    // 提供使用者友善的錯誤訊息
    let errorMessage = '提取過程發生未知錯誤';

    if (error instanceof Error) {
      if (error.message.includes('找不到')) {
        errorMessage = `頁面結構可能已變更，無法找到對話內容。請重新整理頁面後再試。`;
      } else if (error.message.includes('timeout')) {
        errorMessage = '提取逾時，請確認頁面已完全載入後再試。';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 計算提取統計
 */
export function calculateExtractionStats(result: ScrapingResult): {
  messageCount: number;
  sourceCount: number;
  hasWarnings: boolean;
} {
  if (!result.success || !result.content) {
    return { messageCount: 0, sourceCount: 0, hasWarnings: false };
  }

  return {
    messageCount: result.content.metadata.messageCount,
    sourceCount: result.content.metadata.sourceCount || 0,
    hasWarnings: false,
  };
}
