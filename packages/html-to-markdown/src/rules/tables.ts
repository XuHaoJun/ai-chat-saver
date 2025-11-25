/**
 * 表格轉換規則
 *
 * @module html-to-markdown/rules/tables
 */

import type { ConversionRule } from '../types';

/**
 * 提取儲存格內容
 */
function extractCellContent(cell: string): string {
  return cell
    .replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/i, '$1')
    .replace(/<[^>]+>/g, '') // 移除 HTML 標籤
    .replace(/\s+/g, ' ') // 合併空白
    .replace(/\|/g, '\\|') // 跳脫管線符號
    .trim();
}

/**
 * 轉換表格 (<table>) 為 Markdown 表格
 */
export const convertTables: ConversionRule = (html) => {
  let result = html;

  result = result.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    let hasHeader = false;

    // 提取表頭
    const theadMatch = tableContent.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
    if (theadMatch) {
      hasHeader = true;
      const headerRow = theadMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
      if (headerRow) {
        const cells = headerRow[1].match(/<th[^>]*>[\s\S]*?<\/th>/gi) || [];
        rows.push(cells.map(extractCellContent));
      }
    }

    // 提取表身
    const tbodyMatch = tableContent.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    const bodyContent = tbodyMatch ? tbodyMatch[1] : tableContent;

    const bodyRows = bodyContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    bodyRows.forEach((row, index) => {
      // 如果沒有 thead，第一行當作表頭
      const isHeaderRow = !hasHeader && index === 0;
      const cellPattern = isHeaderRow
        ? /<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi
        : /<td[^>]*>[\s\S]*?<\/td>/gi;
      const cells = row.match(cellPattern) || [];

      if (cells.length > 0) {
        rows.push(cells.map(extractCellContent));
        if (isHeaderRow) {
          hasHeader = true;
        }
      }
    });

    if (rows.length === 0) {
      return '';
    }

    // 計算每列最大寬度
    const colWidths = rows[0].map((_, colIndex) =>
      Math.max(...rows.map((row) => (row[colIndex] || '').length), 3)
    );

    // 產生 Markdown 表格
    const lines: string[] = [];

    // 表頭
    const headerRow = rows[0];
    lines.push('| ' + headerRow.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ') + ' |');

    // 分隔線
    lines.push('| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |');

    // 表身
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      lines.push('| ' + row.map((cell, j) => (cell || '').padEnd(colWidths[j])).join(' | ') + ' |');
    }

    return '\n' + lines.join('\n') + '\n\n';
  });

  return result;
};

