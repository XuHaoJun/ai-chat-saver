/**
 * Background Script (Service Worker) 入口
 *
 * @module extension/background
 */

import browser from 'webextension-polyfill';
import { detectPlatform, getSupportedPlatformNames } from '@/utils/platform';
import { getStorage, updateExportStats } from '@/utils/storage';
import {
  showUnsupportedPageNotification,
  showExportSuccess,
  showExtractionError,
} from '@/utils/notifications';
import { DEFAULT_STORAGE } from '@ai-chat-saver/shared-types';
import { launchScraping } from './scraping';
import { outputManager } from './output';

/**
 * 擴充功能安裝時初始化
 */
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 首次安裝，設定預設值
    await browser.storage.sync.set(DEFAULT_STORAGE);
    console.log('AI Chat Saver 已安裝');
  } else if (details.reason === 'update') {
    console.log('AI Chat Saver 已更新至', browser.runtime.getManifest().version);
  }
});

/**
 * 處理擴充功能圖示點擊
 */
browser.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) {
    console.error('無法取得 tab 資訊');
    return;
  }

  // 偵測平台
  const detection = detectPlatform(tab.url);

  if (!detection.supported || !detection.platform) {
    // 顯示不支援頁面的通知 (FR-022)
    const supportedPlatforms = getSupportedPlatformNames();
    await showUnsupportedPageNotification(supportedPlatforms);
    return;
  }

  try {
    // 執行提取
    const result = await launchScraping(tab.id, detection.platform, tab.url);

    if (!result.success || !result.content || !result.filename) {
      const platformName = detection.config?.domainName || detection.platform;
      await showExtractionError(platformName, result.error || '未知錯誤');
      return;
    }

    // 取得使用者設定
    const storage = await getStorage(['includeMetadata', 'outputOptions']);

    // 執行匯出
    const exportResults = await outputManager.exportToAll(result.content, {
      filename: result.filename,
      includeMetadata: storage.includeMetadata,
    });

    // 檢查結果
    const successResults = exportResults.filter((r) => r.success);
    const failedResults = exportResults.filter((r) => !r.success);

    if (successResults.length > 0) {
      // 更新統計
      await updateExportStats(detection.platform);
      await showExportSuccess(result.filename);
    }

    if (failedResults.length > 0) {
      const errors = failedResults.map((r) => r.error).join(', ');
      console.error('部分匯出失敗:', errors);
    }
  } catch (error) {
    console.error('匯出過程發生錯誤:', error);
    const platformName = detection.config?.domainName || detection.platform || '未知平台';
    await showExtractionError(
      platformName,
      error instanceof Error ? error.message : '匯出過程發生未知錯誤'
    );
  }
});

// 標記 Service Worker 已載入
console.log('AI Chat Saver Background Script 已載入');
