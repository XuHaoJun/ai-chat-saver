import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import * as fs from 'fs';

/**
 * 產生 Chrome Manifest V3 的 Vite 插件
 */
function generateManifestPlugin(): Plugin {
  return {
    name: 'generate-manifest',
    writeBundle(options) {
      const outDir = options.dir || 'dist/chrome';

      // Move options.html from src/options/ to options/
      const srcOptionsPath = resolve(outDir, 'src/options/options.html');
      const destOptionsPath = resolve(outDir, 'options/options.html');

      if (fs.existsSync(srcOptionsPath)) {
        // Ensure destination directory exists
        const destDir = resolve(outDir, 'options');
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Move the file
        fs.renameSync(srcOptionsPath, destOptionsPath);
        console.log('Moved options.html to options/options.html');

        // Remove the empty src/options directory
        try {
          fs.rmdirSync(resolve(outDir, 'src/options'));
          fs.rmdirSync(resolve(outDir, 'src'));
        } catch (error) {
          // Ignore errors if directories are not empty or don't exist
        }
      }

      const manifest = {
        manifest_version: 3,
        name: 'AI Chat Saver',
        version: '0.1.0',
        description:
          '從 ChatGPT、Claude、Perplexity、deepwiki、Gemini、Phind 匯出對話為 Markdown 檔案',
        icons: {
          '16': 'icons/icon-16.png',
          '48': 'icons/icon-48.png',
          '128': 'icons/icon-128.png',
        },
        action: {
          default_icon: {
            '16': 'icons/icon-16.png',
            '48': 'icons/icon-48.png',
            '128': 'icons/icon-128.png',
          },
          default_title: '匯出對話',
        },
        permissions: ['activeTab', 'storage', 'downloads', 'notifications', 'scripting'],
        host_permissions: [
          '*://*.chatgpt.com/*',
          '*://*.chat.openai.com/*',
          '*://*.claude.ai/*',
          '*://*.perplexity.ai/*',
          '*://*.phind.com/*',
          '*://*.deepwiki.com/*',
          '*://*.gemini.google.com/*',
        ],
        background: {
          service_worker: 'background.js',
          type: 'module',
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
        options_page: 'options/options.html',
        web_accessible_resources: [
          {
            resources: ['icons/*'],
            matches: ['<all_urls>'],
          },
        ],
      };

      fs.writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
      console.log('Generated manifest.json');
    },
  };
}

export default defineConfig({
  plugins: [react(), generateManifestPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/chrome',
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
