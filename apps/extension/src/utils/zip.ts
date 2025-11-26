/**
 * ZIP 壓縮工具
 *
 * @module extension/utils/zip
 */

import JSZip from 'jszip';
import type { Asset } from '@/types/output';

/**
 * 建立匯出 ZIP 檔案
 *
 * @param markdown - Markdown 內容
 * @param assets - 媒體資產陣列
 * @param mainFilename - 主要 Markdown 檔案名稱（預設為 conversation.md）
 * @returns ZIP Blob
 */
export async function createExportZip(
  markdown: string,
  assets: Asset[],
  mainFilename: string = 'conversation.md'
): Promise<Blob> {
  const zip = new JSZip();

  // 新增主要 Markdown 檔案
  zip.file(mainFilename, markdown);

  // 新增媒體檔案到 assets 資料夾
  if (assets.length > 0) {
    const assetsFolder = zip.folder('assets');
    if (assetsFolder) {
      for (const asset of assets) {
        assetsFolder.file(asset.filename, asset.data);
      }
    }
  }

  // 產生 ZIP
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6, // 平衡壓縮率和速度
    },
  });
}

/**
 * 判斷是否需要產生 ZIP
 *
 * @param assets - 媒體資產陣列
 * @returns 是否需要 ZIP
 */
export function shouldCreateZip(assets: Asset[]): boolean {
  return assets.length > 0;
}

/**
 * 取得匯出檔案的副檔名
 *
 * @param assets - 媒體資產陣列
 * @returns 副檔名（不含點）
 */
export function getFileExtension(assets: Asset[]): string {
  return shouldCreateZip(assets) ? 'zip' : 'md';
}

/**
 * 建立用於下載的 Blob
 *
 * @param markdown - Markdown 內容
 * @param assets - 媒體資產陣列
 * @param mainFilename - 主要檔案名稱
 * @returns 下載用的 Blob 和建議檔名
 */
export async function createDownloadBlob(
  markdown: string,
  assets: Asset[],
  baseFilename: string
): Promise<{ blob: Blob; filename: string }> {
  if (shouldCreateZip(assets)) {
    const blob = await createExportZip(markdown, assets);
    return {
      blob,
      filename: `${baseFilename}.zip`,
    };
  }

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  return {
    blob,
    filename: `${baseFilename}.md`,
  };
}
