/**
 * 瀏覽器擴充功能 Manifest 產生器
 *
 * 根據目標瀏覽器產生對應版本的 manifest.json
 *
 * @module scripts/manifest-generator
 */

import * as fs from 'fs';
import * as path from 'path';

type Browser = 'chrome' | 'firefox';

interface BaseManifest {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage_url?: string;
  icons: Record<string, string>;
  permissions: string[];
  content_scripts: Array<{
    matches: string[];
    js: string[];
    run_at: string;
  }>;
}

interface ChromeManifestV3 extends BaseManifest {
  manifest_version: 3;
  action: {
    default_icon: Record<string, string>;
    default_title: string;
  };
  host_permissions: string[];
  background: {
    service_worker: string;
    type: string;
  };
  options_page: string;
  web_accessible_resources: Array<{
    resources: string[];
    matches: string[];
  }>;
}

interface FirefoxManifestV2 extends BaseManifest {
  manifest_version: 2;
  browser_action: {
    default_icon: Record<string, string>;
    default_title: string;
  };
  background: {
    scripts: string[];
    persistent: boolean;
  };
  options_ui: {
    page: string;
    open_in_tab: boolean;
  };
  web_accessible_resources: string[];
  browser_specific_settings?: {
    gecko: {
      id: string;
      strict_min_version: string;
    };
  };
}

const BASE_CONFIG = {
  name: 'AI Chat Saver',
  version: '0.1.0',
  description: '從 ChatGPT、Claude、Perplexity、deepwiki、Gemini、Phind 匯出對話為 Markdown 檔案',
  author: 'AI Chat Saver Team',
  homepage_url: 'https://github.com/user/ai-chat-saver',
  icons: {
    '16': 'icons/icon-16.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  permissions: ['activeTab', 'storage', 'downloads', 'notifications'],
  host_patterns: [
    '*://*.chatgpt.com/*',
    '*://*.chat.openai.com/*',
    '*://*.claude.ai/*',
    '*://*.perplexity.ai/*',
    '*://*.phind.com/*',
    '*://*.deepwiki.com/*',
    '*://*.gemini.google.com/*',
  ],
  content_scripts: [
    {
      matches: [
        '*://*.chatgpt.com/*',
        '*://*.chat.openai.com/*',
        '*://*.claude.ai/*',
        '*://*.perplexity.ai/*',
        '*://*.phind.com/*',
        '*://*.deepwiki.com/*',
        '*://*.gemini.google.com/*',
      ],
      js: ['content.js'],
      run_at: 'document_idle',
    },
  ],
};

/**
 * 產生 Chrome Manifest V3
 */
export function generateChromeManifest(): ChromeManifestV3 {
  return {
    manifest_version: 3,
    name: BASE_CONFIG.name,
    version: BASE_CONFIG.version,
    description: BASE_CONFIG.description,
    author: BASE_CONFIG.author,
    homepage_url: BASE_CONFIG.homepage_url,
    icons: BASE_CONFIG.icons,
    action: {
      default_icon: BASE_CONFIG.icons,
      default_title: '匯出對話',
    },
    permissions: [...BASE_CONFIG.permissions, 'scripting'],
    host_permissions: BASE_CONFIG.host_patterns,
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
    content_scripts: BASE_CONFIG.content_scripts,
    options_page: 'options/options.html',
    web_accessible_resources: [
      {
        resources: ['icons/*'],
        matches: ['<all_urls>'],
      },
    ],
  };
}

/**
 * 產生 Firefox Manifest V2
 */
export function generateFirefoxManifest(): FirefoxManifestV2 {
  return {
    manifest_version: 2,
    name: BASE_CONFIG.name,
    version: BASE_CONFIG.version,
    description: BASE_CONFIG.description,
    author: BASE_CONFIG.author,
    homepage_url: BASE_CONFIG.homepage_url,
    icons: BASE_CONFIG.icons,
    browser_action: {
      default_icon: BASE_CONFIG.icons,
      default_title: '匯出對話',
    },
    permissions: [...BASE_CONFIG.permissions, ...BASE_CONFIG.host_patterns],
    background: {
      scripts: ['background.js'],
      persistent: false,
    },
    content_scripts: BASE_CONFIG.content_scripts,
    options_ui: {
      page: 'options/options.html',
      open_in_tab: true,
    },
    web_accessible_resources: ['icons/*'],
    browser_specific_settings: {
      gecko: {
        id: 'ai-chat-saver@example.com',
        strict_min_version: '91.0',
      },
    },
  };
}

/**
 * 產生並寫入 manifest.json
 */
export function writeManifest(browser: Browser, outputDir: string): void {
  const manifest = browser === 'chrome' ? generateChromeManifest() : generateFirefoxManifest();

  const outputPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

  console.log(`Generated ${browser} manifest at ${outputPath}`);
}

// CLI 執行
if (process.argv[1]?.includes('manifest-generator')) {
  const browser = process.argv[2] as Browser;
  const outputDir = process.argv[3] || './dist';

  if (!['chrome', 'firefox'].includes(browser)) {
    console.error('Usage: ts-node manifest-generator.ts <chrome|firefox> [outputDir]');
    process.exit(1);
  }

  writeManifest(browser, outputDir);
}
