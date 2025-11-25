/**
 * 瀏覽器擴充功能建置腳本
 *
 * @module scripts/build
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { writeManifest } from './manifest-generator';

type Browser = 'chrome' | 'firefox';

const EXTENSION_DIR = path.resolve(__dirname, '../apps/extension');
const DIST_DIR = path.resolve(__dirname, '../apps/extension/dist');

/**
 * 執行命令
 */
function exec(command: string, cwd?: string): void {
  console.log(`> ${command}`);
  execSync(command, {
    cwd: cwd || EXTENSION_DIR,
    stdio: 'inherit',
  });
}

/**
 * 確保目錄存在
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 複製檔案
 */
function copyFile(src: string, dest: string): void {
  fs.copyFileSync(src, dest);
}

/**
 * 複製目錄
 */
function copyDir(src: string, dest: string): void {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

/**
 * 建置擴充功能
 */
async function build(browser: Browser): Promise<void> {
  const outputDir = path.join(DIST_DIR, browser);

  console.log(`\n🔨 Building for ${browser}...\n`);

  // 清理輸出目錄
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  ensureDir(outputDir);

  // 執行 Vite 建置
  const mode = process.env.NODE_ENV || 'production';
  exec(`pnpm vite build --mode ${mode} --outDir ${outputDir}`);

  // 產生對應的 manifest.json
  writeManifest(browser, outputDir);

  // 複製圖示
  const iconsDir = path.join(EXTENSION_DIR, 'public/icons');
  if (fs.existsSync(iconsDir)) {
    copyDir(iconsDir, path.join(outputDir, 'icons'));
  }

  console.log(`\n✅ ${browser} build complete: ${outputDir}\n`);
}

/**
 * 建置所有瀏覽器版本
 */
async function buildAll(): Promise<void> {
  await build('chrome');
  await build('firefox');
}

// CLI 執行
const browser = process.argv[2] as Browser | 'all';

if (browser === 'all') {
  buildAll();
} else if (['chrome', 'firefox'].includes(browser)) {
  build(browser as Browser);
} else {
  console.log('Usage: ts-node build.ts <chrome|firefox|all>');
  console.log('  chrome  - Build for Chrome (Manifest V3)');
  console.log('  firefox - Build for Firefox (Manifest V2)');
  console.log('  all     - Build for all browsers');
}

