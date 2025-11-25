import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import * as fs from 'fs';

/**
 * 產生 Firefox Manifest V2 的 Vite 插件
 */
function generateFirefoxManifestPlugin(): Plugin {
  return {
    name: 'generate-firefox-manifest',
    writeBundle(options) {
      const outDir = options.dir || 'dist/firefox';
      const manifest = {
        manifest_version: 2,
        name: 'AI Chat Saver',
        version: '0.1.0',
        description:
          '從 ChatGPT、Claude、Perplexity、deepwiki、Gemini、Phind 匯出對話為 Markdown 檔案',
        icons: {
          '16': 'icons/icon-16.png',
          '48': 'icons/icon-48.png',
          '128': 'icons/icon-128.png',
        },
        browser_action: {
          default_icon: {
            '16': 'icons/icon-16.png',
            '48': 'icons/icon-48.png',
            '128': 'icons/icon-128.png',
          },
          default_title: '匯出對話',
        },
        permissions: [
          'activeTab',
          'storage',
          'downloads',
          'notifications',
          '*://*.chatgpt.com/*',
          '*://*.chat.openai.com/*',
          '*://*.claude.ai/*',
          '*://*.perplexity.ai/*',
          '*://*.phind.com/*',
          '*://*.deepwiki.com/*',
          '*://*.gemini.google.com/*',
        ],
        background: {
          scripts: ['background.js'],
          persistent: false,
        },
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
        options_ui: {
          page: 'src/options/options.html',
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

      fs.writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
      console.log('Generated Firefox manifest.json');
    },
  };
}

export default defineConfig({
  plugins: [react(), generateFirefoxManifestPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/firefox',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        options: resolve(__dirname, 'src/options/options.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
