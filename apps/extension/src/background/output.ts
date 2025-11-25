/**
 * 輸出管理器
 *
 * @module extension/background/output
 */

import browser from 'webextension-polyfill';
import type { OutputDestination, ExportContent, ExportOptions, ExportResult } from '@/types/output';
import { createDownloadBlob } from '@/utils/zip';

/**
 * 本地下載目的地
 */
export class LocalDownloadDestination implements OutputDestination {
  readonly name = 'local-download';
  readonly displayName = '本地下載';
  readonly description = '下載為 Markdown 或 ZIP 檔案';
  enabled = true;
  readonly requiresConfiguration = false;

  async export(content: ExportContent, options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      // 建立下載 Blob
      const { blob, filename } = await createDownloadBlob(
        content.markdown,
        content.assets,
        options.filename
      );

      // 建立 Object URL
      const url = URL.createObjectURL(blob);

      try {
        // 執行下載
        await browser.downloads.download({
          url,
          filename,
          saveAs: false,
        });

        return {
          success: true,
          destination: this.name,
          details: {
            fileSize: blob.size,
            duration: Date.now() - startTime,
          },
        };
      } finally {
        // 清理 Object URL
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      return {
        success: false,
        destination: this.name,
        error: error instanceof Error ? error.message : '下載失敗',
      };
    }
  }
}

/**
 * 輸出管理器
 */
export class OutputManager {
  private destinations: Map<string, OutputDestination> = new Map();

  constructor() {
    // 預設註冊本地下載
    this.register(new LocalDownloadDestination());
  }

  /**
   * 註冊新的輸出目的地
   */
  register(destination: OutputDestination): void {
    this.destinations.set(destination.name, destination);
  }

  /**
   * 取得所有已註冊的目的地
   */
  getDestinations(): OutputDestination[] {
    return Array.from(this.destinations.values());
  }

  /**
   * 取得已啟用的目的地
   */
  getEnabledDestinations(): OutputDestination[] {
    return this.getDestinations().filter((d) => d.enabled);
  }

  /**
   * 根據名稱取得目的地
   */
  getDestination(name: string): OutputDestination | undefined {
    return this.destinations.get(name);
  }

  /**
   * 執行匯出到所有已啟用的目的地
   */
  async exportToAll(content: ExportContent, options: ExportOptions): Promise<ExportResult[]> {
    const enabledDestinations = this.getEnabledDestinations();
    const results: ExportResult[] = [];

    for (const destination of enabledDestinations) {
      const result = await destination.export(content, options);
      results.push(result);
    }

    return results;
  }

  /**
   * 執行匯出到指定目的地
   */
  async exportTo(
    destinationName: string,
    content: ExportContent,
    options: ExportOptions
  ): Promise<ExportResult> {
    const destination = this.getDestination(destinationName);

    if (!destination) {
      return {
        success: false,
        destination: destinationName,
        error: `找不到目的地: ${destinationName}`,
      };
    }

    if (!destination.enabled) {
      return {
        success: false,
        destination: destinationName,
        error: `目的地已停用: ${destinationName}`,
      };
    }

    return destination.export(content, options);
  }
}

/**
 * Webhook 目的地
 */
export class WebhookDestination implements OutputDestination {
  readonly name = 'webhook';
  readonly displayName = 'Webhook';
  readonly description = '將對話內容傳送到指定的 URL';
  enabled = false;
  readonly requiresConfiguration = true;

  private webhookUrl: string = '';

  setUrl(url: string): void {
    this.webhookUrl = url;
  }

  async export(content: ExportContent, options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();

    if (!this.webhookUrl) {
      return {
        success: false,
        destination: this.name,
        error: '未設定 Webhook URL',
      };
    }

    try {
      // 準備請求資料
      const payload = {
        markdown: content.markdown,
        metadata: {
          ...content.metadata,
          exportedAt: content.metadata.exportedAt.toISOString(),
        },
        filename: options.filename,
        hasAssets: content.assets.length > 0,
        assetCount: content.assets.length,
      };

      // 發送請求
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          success: false,
          destination: this.name,
          error: `Webhook 回應錯誤: ${response.status} ${response.statusText}`,
        };
      }

      return {
        success: true,
        destination: this.name,
        details: {
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        destination: this.name,
        error: error instanceof Error ? error.message : 'Webhook 請求失敗',
      };
    }
  }
}

// 全域輸出管理器實例
export const outputManager = new OutputManager();

// 註冊 Webhook 目的地
const webhookDestination = new WebhookDestination();
outputManager.register(webhookDestination);

/**
 * 設定 Webhook URL 並啟用/停用
 */
export function configureWebhook(url: string, enabled: boolean): void {
  webhookDestination.setUrl(url);
  webhookDestination.enabled = enabled;
}
