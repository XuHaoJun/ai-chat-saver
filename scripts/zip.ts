/**
 * 擴充功能打包腳本
 *
 * @module scripts/zip
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

type Browser = 'chrome' | 'firefox';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../apps/extension/dist');

/**
 * 建立 ZIP 檔案
 */
async function createZip(browser: Browser): Promise<void> {
  const sourceDir = path.join(DIST_DIR, browser);
  const version = getVersion();
  const zipName = `ai-chat-saver-${version}-${browser}.zip`;
  const zipPath = path.join(DIST_DIR, zipName);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: ${sourceDir} does not exist. Run build first.`);
    process.exit(1);
  }

  // 刪除舊的 ZIP
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // 建立 ZIP
  console.log(`Creating ${zipName}...`);

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Best compression
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const stats = fs.statSync(zipPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`✅ Created: ${zipPath} (${sizeMB} MB)`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * 取得版本號
 */
function getVersion(): string {
  const packagePath = path.resolve(__dirname, '../apps/extension/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  return packageJson.version;
}

/**
 * 打包所有版本
 */
async function zipAll(): Promise<void> {
  await createZip('chrome');
  await createZip('firefox');
}

// CLI 執行
const browser = process.argv[2] as Browser | 'all';

async function main() {
  if (browser === 'all') {
    await zipAll();
  } else if (['chrome', 'firefox'].includes(browser)) {
    await createZip(browser as Browser);
  } else {
    console.log('Usage: ts-node zip.ts <chrome|firefox|all>');
  }
}

main().catch(console.error);
