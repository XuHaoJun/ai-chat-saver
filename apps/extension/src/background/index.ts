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
  showConcurrentExportNotification,
} from '@/utils/notifications';
import { DEFAULT_STORAGE } from '@ai-chat-saver/shared-types';
import { launchScraping } from './scraping';
import { outputManager } from './output';

/**
 * 匯出狀態管理
 */
class ExportStateManager {
  private isExporting = false;
  private currentStep = 0;
  private totalSteps = 4; // 預設步驟數：載入腳本、提取內容、格式化、匯出
  private readonly processingIcon = {
    '16': 'icons/icon_disabled-16.png',
    '48': 'icons/icon_disabled-48.png',
    '128': 'icons/icon_disabled-128.png',
  };
  private readonly normalIcon = {
    '16': 'icons/icon-16.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  };

  /**
   * 檢查是否正在匯出
   */
  isCurrentlyExporting(): boolean {
    return this.isExporting;
  }

  /**
   * 開始匯出 - 設定載入狀態
   */
  startExport(totalSteps = 4): void {
    if (this.isExporting) {
      return; // Already exporting
    }

    this.isExporting = true;
    this.currentStep = 0;
    this.totalSteps = totalSteps;
    this.updateIcon(true);
    this.updateProgressTitle();
    console.log('[AI Chat Saver] Export started - showing loading state');
  }

  /**
   * 更新進度
   */
  updateProgress(step: number, description?: string): void {
    if (!this.isExporting) {
      return;
    }

    this.currentStep = step;
    this.updateProgressTitle(description);
    console.log(
      `[AI Chat Saver] Progress: ${step}/${this.totalSteps} - ${description || 'Processing...'}`
    );
  }

  /**
   * 結束匯出 - 恢復正常狀態
   */
  endExport(): void {
    if (!this.isExporting) {
      return; // Not exporting
    }

    this.isExporting = false;
    this.currentStep = 0;
    this.updateIcon(false);
    this.updateTitle('匯出對話');
    console.log('[AI Chat Saver] Export finished - restoring normal state');
  }

  /**
   * 更新進度標題
   */
  private updateProgressTitle(description?: string): void {
    const baseText = description || 'Processing...';
    const progressText =
      this.totalSteps > 1 ? `${baseText} (${this.currentStep}/${this.totalSteps})` : baseText;
    this.updateTitle(progressText);
  }

  /**
   * 更新擴充功能圖示
   */
  private updateIcon(isProcessing: boolean): void {
    try {
      browser.action
        .setIcon({
          path: isProcessing ? this.processingIcon : this.normalIcon,
        })
        .catch((error) => {
          console.error('[AI Chat Saver] Failed to update icon:', error);
        });
    } catch (error) {
      console.error('[AI Chat Saver] Error updating icon:', error);
    }
  }

  /**
   * 更新擴充功能標題
   */
  private updateTitle(title: string): void {
    try {
      browser.action.setTitle({ title }).catch((error) => {
        console.error('[AI Chat Saver] Failed to update title:', error);
      });
    } catch (error) {
      console.error('[AI Chat Saver] Error updating title:', error);
    }
  }
}

// 全域匯出狀態管理器實例
export const exportStateManager = new ExportStateManager();

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

  // 檢查是否正在匯出 (FR-023)
  if (exportStateManager.isCurrentlyExporting()) {
    await showConcurrentExportNotification();
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

  // 開始匯出 - 顯示載入狀態 (FR-022)
  exportStateManager.startExport(5); // 5 個步驟：載入腳本、提取內容、格式化、準備匯出、下載

  try {
    // 執行提取
    const result = await launchScraping(
      tab.id,
      detection.platform,
      tab.url,
      (step, description) => {
        exportStateManager.updateProgress(step, description);
      }
    );

    // 步驟 5: 執行下載
    exportStateManager.updateProgress(5, '下載檔案...');

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
  } finally {
    // 結束匯出 - 恢復正常狀態
    exportStateManager.endExport();
  }
});

// 標記 Service Worker 已載入
console.log('AI Chat Saver Background Script 已載入');
