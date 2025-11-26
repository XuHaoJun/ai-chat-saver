/**
 * Content Script 入口
 *
 * @module extension/content
 */

// Note: Using chrome API directly to avoid ES6 import issues in content scripts
declare global {
  const chrome: {
    runtime: {
      onMessage: {
        addListener: (callback: (message: any, sender: any, sendResponse: (response: any) => void) => boolean | void) => void;
      };
      MessageSender: any;
    };
  };
}
import type { Platform } from '@ai-chat-saver/shared-types';
import type { ExtractionConfig } from '@ai-chat-saver/extraction-configs';
import type { ExtractedContent } from '@/types/extraction';
import { performExtraction, createErrorResult } from './extractors';

/**
 * 訊息類型定義
 */
interface PingMessage {
  type: 'PING';
}

interface ExtractContentMessage {
  type: 'EXTRACT_CONTENT';
  platform: Platform;
  pageConfig: ExtractionConfig;
}

type Message = PingMessage | ExtractContentMessage;

/**
 * 處理來自 Background Script 的訊息
 * 
 * IMPORTANT: Chrome's onMessage requires returning `true` synchronously
 * to indicate async response, then call sendResponse when ready
 */
function handleMessage(
  message: Message,
  _sender: any,
  sendResponse: (response: any) => void
): boolean | void {
  switch (message.type) {
    case 'PING':
      // 回應 ping 請求，表示 content script 已載入
      sendResponse({ success: true, loaded: true });
      return; // Synchronous response, no need to return true

    case 'EXTRACT_CONTENT':
      // Handle async extraction - MUST return true to keep channel open
      handleExtractionRequest(message).then(sendResponse);
      return true; // Keep the message channel open for async response

    default:
      // 不處理的訊息類型
      return;
  }
}

/**
 * 處理提取請求
 */
async function handleExtractionRequest(message: ExtractContentMessage): Promise<ExtractedContent> {
  const { platform, pageConfig } = message;

  console.log('[AI Chat Saver] Handling extraction request for platform:', platform);

  try {
    // 等待頁面完全載入
    if (document.readyState !== 'complete') {
      console.log('[AI Chat Saver] Waiting for page to load...');
      await new Promise<void>((resolve) => {
        window.addEventListener('load', () => resolve(), { once: true });
      });
    }

    // 執行提取
    console.log('[AI Chat Saver] Starting extraction...');
    const result = performExtraction(platform, pageConfig);
    console.log('[AI Chat Saver] Extraction result:', result);
    console.log('[AI Chat Saver] Returning result via sendResponse...');
    return result;
  } catch (error) {
    console.error('[AI Chat Saver] Extraction error:', error);
    return createErrorResult(error instanceof Error ? error.message : '提取過程發生未知錯誤');
  }
}

/**
 * 初始化 content script
 */
function init(): void {
  console.log('[AI Chat Saver] Content script initializing on:', window.location.href);

  // 註冊訊息監聽器
  chrome.runtime.onMessage.addListener(handleMessage);

  // 註冊自定義事件監聽器（用於 scripting.executeScript 通訊）
  document.addEventListener('ai-chat-saver-extract', async (event) => {
    const customEvent = event as CustomEvent;
    const { platform, config } = customEvent.detail;
    
    console.log('[AI Chat Saver] Received extraction request via custom event');
    
    try {
      const result = performExtraction(platform, config);
      console.log('[AI Chat Saver] Extraction complete, dispatching result event');
      
      // Store result in DOM element for backup
      let resultContainer = document.getElementById('ai-chat-saver-result');
      if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'ai-chat-saver-result';
        resultContainer.style.display = 'none';
        document.body.appendChild(resultContainer);
      }
      resultContainer.textContent = JSON.stringify(result);
      
      // Dispatch result event
      document.dispatchEvent(new CustomEvent('ai-chat-saver-result', {
        detail: result
      }));
    } catch (error) {
      console.error('[AI Chat Saver] Extraction via event failed:', error);
      const errorResult = createErrorResult(error instanceof Error ? error.message : '提取失敗');
      document.dispatchEvent(new CustomEvent('ai-chat-saver-result', {
        detail: errorResult
      }));
    }
  });

  // 標記 content script 已載入
  document.documentElement.setAttribute('data-ai-chat-saver-loaded', 'true');

  console.log('[AI Chat Saver] Content script loaded successfully');
}

// 初始化
init();
