# AI Chat Saver

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A browser extension that exports conversations from popular AI chat platforms to Markdown files for offline access, sharing, and archival.

中文: 瀏覽器擴充功能：從 ChatGPT、Claude、Perplexity、DeepWiki、Gemini、Phind 匯出對話為 Markdown 檔案

> **Note**: This project is a rewrite of [SaveMyPhind](https://github.com/Hugo-COLLIN/SaveMyPhind-conversation-exporter) from Imba to pure TypeScript + React, extended to support DeepWiki and Gemini platforms.

## 🚀 Features

- **Multi-platform Support**: Export conversations from ChatGPT, Claude, Perplexity, DeepWiki, Gemini, and Phind
- **Cross-browser Compatibility**: Works on both Chrome and Firefox
- **Markdown Export**: Clean, properly formatted Markdown files with preserved formatting
- **Customizable Settings**: Configure filename templates, output options, and content preferences
- **Progress Feedback**: Visual feedback during export processing
- **Media Support**: Downloads embedded media and includes local file paths in Markdown
- **Large Conversation Support**: Handles conversations with thousands of messages
- **✨ Easy Platform Addition**: Use AI-powered command to automatically generate extraction configs for new platforms

## 🎯 Supported Platforms

- ✅ ChatGPT (`*.chatgpt.com`, `*.chat.openai.com`)
- ✅ Claude (`*.claude.ai`)
- ✅ Perplexity (`*.perplexity.ai`)
- ✅ Phind (`*.phind.com`)
- ✅ DeepWiki (`*.deepwiki.com`)
- ✅ Gemini (`*.gemini.google.com`)

## 🆕 Adding Custom Platforms (AI-Powered)

> **New!** You can now easily add support for new AI chat platforms using our AI-powered extraction command.
> 
> **Note**: This feature requires [Cursor IDE](https://cursor.sh/) - the `/extract-user-platform` command is a Cursor-specific command.

### Quick Start

1. **Create a platform directory** in `user-platforms/`:
   ```bash
   mkdir -p user-platforms/my-platform/samples
   ```

2. **Add `platform.json`** with basic info:
   ```json
   {
     "id": "my-platform",
     "name": "My Platform",
     "domain": "my-platform.ai",
     "urlPatterns": ["my-platform.ai/chat/"]
   }
   ```

3. **Save HTML samples** from the platform to `samples/` directory

4. **Run the extraction command** in Cursor IDE:
   ```
   /extract-user-platform my-platform
   ```
   
   > **Note**: This command is only available in [Cursor IDE](https://cursor.sh/). If you're using a different editor, see the [Manual Method](#method-2-manual) below.

The command will:
- ✅ Analyze HTML structure using AI
- ✅ Automatically detect extraction type (message-list or search-sections)
- ✅ Generate complete TypeScript extraction config
- ✅ Update index files and type definitions
- ✅ Ready to use immediately!

See [`user-platforms/README.md`](user-platforms/README.md) for detailed documentation.

## 📦 Installation

### From Source (Development)

1. **Clone the repository**

   ```bash
   git clone https://github.com/user/ai-chat-saver.git
   cd ai-chat-saver
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build for your browser**

   ```bash
   # For Chrome
   pnpm build:chrome

   # For Firefox
   pnpm build:firefox
   ```

4. **Load the extension**
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select `apps/extension/dist/chrome/`
   - **Firefox**: Go to `about:debugging`, click "This Firefox", click "Load Temporary Add-on", and select `apps/extension/dist/firefox/manifest.json`

### Production Build

Build optimized versions for distribution:

```bash
# Build both browsers and create zip files
pnpm prod
```

This creates:

- `apps/extension/dist/chrome/` - Chrome extension
- `apps/extension/dist/firefox/` - Firefox extension
- `*.zip` files for distribution

## 🔧 Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm dev:chrome       # Development build for Chrome with watch mode
pnpm dev:firefox      # Development build for Firefox with watch mode

# Building
pnpm build            # Build for both browsers
pnpm build:chrome     # Production build for Chrome
pnpm build:firefox    # Production build for Firefox
pnpm prod            # Full production build with zipping

# Quality
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix ESLint issues
pnpm typecheck       # Run TypeScript type checking
pnpm format          # Format code with Prettier
pnpm format:check    # Check code formatting

# Testing
pnpm test            # Run all tests
pnpm test:unit       # Run unit tests
pnpm test:integration # Run integration tests
pnpm test:watch      # Run tests in watch mode

# Cleanup
pnpm clean           # Clean build artifacts
```

### Project Structure

```
ai-chat-saver/
├── apps/
│   └── extension/           # Browser extension
│       ├── src/
│       │   ├── background/  # Service worker
│       │   ├── content/     # Content scripts and extractors
│       │   ├── options/     # Settings page
│       │   ├── popup/       # Extension popup
│       │   └── types/       # TypeScript types
│       └── dist/            # Built extension files
├── packages/
│   ├── extraction-configs/  # Platform-specific extraction rules
│   ├── html-to-markdown/    # HTML to Markdown converter
│   └── shared-types/        # Shared TypeScript types
├── scripts/                 # Build and utility scripts
├── specs/                   # Project specifications
└── test/                    # Test fixtures and utilities
```

### Architecture

The project uses a monorepo structure with shared packages:

- **`@ai-chat-saver/extension`**: Main browser extension
- **`@ai-chat-saver/extraction-configs`**: Platform-specific extraction configurations
- **`@ai-chat-saver/html-to-markdown`**: HTML parsing and Markdown conversion
- **`@ai-chat-saver/shared-types`**: Shared TypeScript interfaces

## 🎨 Customization

Access the extension settings by:

1. Clicking the extension icon
2. Right-clicking and selecting "Options" or "Manage Extension"
3. Going to browser extension settings

Available settings:

- **Filename Template**: Customize how exported files are named
- **Content Options**: Include/exclude metadata, sources, timestamps
- **Output Format**: Configure Markdown formatting preferences

## 🧪 Testing

The extension includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit          # Unit tests
pnpm test:integration   # Integration tests

# Watch mode for development
pnpm test:watch
```

Test fixtures include sample HTML from supported platforms in `test/fixtures/html-samples/`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Format code: `pnpm format`
6. Commit your changes: `git commit -am 'Add your feature'`
7. Push to the branch: `git push origin feature/your-feature`
8. Submit a pull request

### Adding Support for New Platforms

#### Method 1: AI-Powered (Recommended - Cursor IDE Only)

Use the `/extract-user-platform` command in [Cursor IDE](https://cursor.sh/) (see [Adding Custom Platforms](#-adding-custom-platforms-ai-powered) section above).

#### Method 2: Manual

1. Add platform configuration in `packages/extraction-configs/src/platforms/`
2. Update `packages/extraction-configs/src/index.ts` to export the new config
3. Update `packages/shared-types/src/conversation.ts` to add the platform type
4. Update manifest permissions in `apps/extension/manifest.json`
5. Add extraction logic in `apps/extension/src/content/extractors/`
6. Update documentation and tests

## 🚀 Release Process

This project uses GitHub Actions for automated releases. To create a new release:

1. **Update version numbers** in relevant `package.json` files
2. **Commit and push** your changes
3. **Create and push a version tag**:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

The CI/CD pipeline will automatically:

- Build Chrome and Firefox extension packages
- Create release archives
- Publish a GitHub release with downloadable assets

### Release Assets

Each release includes:

- `ai-chat-saver-{version}-chrome.zip` - Chrome extension package
- `ai-chat-saver-{version}-firefox.zip` - Firefox extension package

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- Uses [Turborepo](https://turbo.build/) for monorepo management
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Extension APIs via [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)

## 📞 Support

If you encounter issues or need help:

1. Check the [Issues](https://github.com/user/ai-chat-saver/issues) page
2. Create a new issue with:
   - Browser and version
   - Platform you're trying to export from
   - Steps to reproduce
   - Expected vs actual behavior

For platform-specific extraction issues, please include:

- URL of the conversation (without sensitive information)
- Screenshot of the page structure if possible
