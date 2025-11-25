/**
 * Content Script 入口
 *
 * @module extension/content
 */

import browser from 'webextension-polyfill';
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
 */
function handleMessage(
  message: Message,
  _sender: browser.Runtime.MessageSender
): Promise<unknown> | void {
  switch (message.type) {
    case 'PING':
      // 回應 ping 請求，表示 content script 已載入
      return Promise.resolve({ success: true, loaded: true });

    case 'EXTRACT_CONTENT':
      return handleExtractionRequest(message);

    default:
      // 不處理的訊息類型，返回 undefined
      return;
  }
}

/**
 * 處理提取請求
 */
async function handleExtractionRequest(
  message: ExtractContentMessage
): Promise<ExtractedContent> {
  const { platform, pageConfig } = message;

  try {
    // 等待頁面完全載入
    if (document.readyState !== 'complete') {
      await new Promise<void>((resolve) => {
        window.addEventListener('load', () => resolve(), { once: true });
      });
    }

    // 執行提取
    const result = performExtraction(platform, pageConfig);
    return result;
  } catch (error) {
    return createErrorResult(
      error instanceof Error ? error.message : '提取過程發生未知錯誤'
    );
  }
}

/**
 * 初始化 content script
 */
function init(): void {
  // 註冊訊息監聽器
  browser.runtime.onMessage.addListener(handleMessage);

  // 標記 content script 已載入
  document.documentElement.setAttribute('data-ai-chat-saver-loaded', 'true');
}

// 初始化
init();

