/**
 * 檔名格式化工具
 *
 * @module extension/utils/filename
 */

/**
 * 檔名格式化參數
 */
export interface FilenameParams {
  /** 對話標題 */
  title: string;

  /** 平台名稱 */
  platform: string;

  /** 主機名稱 */
  hostname?: string;

  /** 時間戳（預設為目前時間） */
  timestamp?: Date;
}

/**
 * 清理檔名，移除非法字元
 *
 * @param filename - 原始檔名
 * @returns 清理後的檔名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // 移除 Windows 非法字元
    .replace(/[\x00-\x1f]/g, '') // 移除控制字元
    .replace(/\s+/g, '_') // 空白轉底線
    .replace(/_+/g, '_') // 合併多個底線
    .replace(/^_|_$/g, '') // 移除首尾底線
    .slice(0, 100); // 限制長度
}

/**
 * 格式化數字為兩位數
 */
function padTwo(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * 格式化檔名範本
 *
 * @param template - 檔名範本
 * @param params - 格式化參數
 * @returns 格式化後的檔名
 *
 * 支援的佔位符：
 * - %Y: 年（四位數）
 * - %M: 月（兩位數）
 * - %D: 日（兩位數）
 * - %h: 時（兩位數，24 小時制）
 * - %m: 分（兩位數）
 * - %s: 秒（兩位數）
 * - %t: Unix 時間戳
 * - %W: 平台名稱
 * - %H: 主機名稱
 * - %T: 對話標題（清理後）
 */
export function formatFilename(template: string, params: FilenameParams): string {
  const date = params.timestamp || new Date();

  const replacements: Record<string, string> = {
    '%Y': date.getFullYear().toString(),
    '%M': padTwo(date.getMonth() + 1),
    '%D': padTwo(date.getDate()),
    '%h': padTwo(date.getHours()),
    '%m': padTwo(date.getMinutes()),
    '%s': padTwo(date.getSeconds()),
    '%t': Math.floor(date.getTime() / 1000).toString(),
    '%W': sanitizeFilename(params.platform),
    '%H': sanitizeFilename(params.hostname || ''),
    '%T': sanitizeFilename(params.title),
  };

  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }

  // 最終清理
  return sanitizeFilename(result) || 'export';
}

/**
 * 取得預設檔名範本
 */
export function getDefaultFilenameTemplate(): string {
  return '%Y-%M-%D_%h-%m-%s_%W_%T';
}

/**
 * 驗證檔名範本
 *
 * @param template - 檔名範本
 * @returns 是否有效
 */
export function validateFilenameTemplate(template: string): boolean {
  if (!template || template.length === 0) return false;
  if (template.length > 200) return false;

  // 移除所有佔位符後，檢查是否還有內容或佔位符
  const placeholders = ['%Y', '%M', '%D', '%h', '%m', '%s', '%t', '%W', '%H', '%T'];
  let remaining = template;

  for (const p of placeholders) {
    remaining = remaining.replace(new RegExp(p, 'g'), '');
  }

  // 至少要有一個佔位符或一些固定文字
  return template.length !== remaining.length || remaining.trim().length > 0;
}
