---
description: Analyze a user platform from user-platforms directory and generate extraction config using LLM analysis
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding. The user input should be the platform ID (e.g., "deepseek", "my-platform").

## Goal

Analyze a user platform configuration from the `user-platforms/` directory, use LLM to analyze HTML samples, and generate a complete extraction config file in `packages/extraction-configs/src/platforms/`.

## Execution Steps

### 1. Validate Input and Locate Platform

1. Parse the platform ID from `$ARGUMENTS` (should be a single word, lowercase, no spaces)
2. Check if `user-platforms/{PLATFORM_ID}/` directory exists
3. Verify `user-platforms/{PLATFORM_ID}/platform.json` exists
4. Check if `user-platforms/{PLATFORM_ID}/samples/` directory exists and contains at least one HTML file

If any check fails, report the error and stop execution.

### 2. Load Platform Metadata

1. Read `user-platforms/{PLATFORM_ID}/platform.json`
2. Validate it contains required fields:
   - `id` (must match the platform ID)
   - `name`
   - `domain`
   - `urlPatterns` (array of strings)

### 3. Load HTML Samples

1. List all HTML files in `user-platforms/{PLATFORM_ID}/samples/`
2. Read the first HTML sample file (or all if small enough)
3. If HTML files are very large (>50KB), read a representative portion (first 20KB and last 10KB, or use a smart truncation)

### 4. Analyze HTML Structure with LLM

Use the LLM to analyze the HTML and determine:

1. **Extraction Type**: Determine if it's `message-list` or `search-sections`:
   - Look for patterns like alternating user/AI messages → `message-list`
   - Look for Q&A blocks or search result sections → `search-sections`

2. **Page Title Selector**: Find the selector for the conversation/page title:
   - Check `<title>` tag
   - Look for heading elements (h1, h2) with conversation-related classes
   - Identify data attributes like `data-testid`, `data-cy`, etc.

3. **Content Container**: Find the main content container:
   - Look for semantic elements: `main`, `article`, `[role="main"]`
   - Check for containers with conversation/message-related classes
   - Identify data attributes

4. **Message/Section Selectors** (based on extraction type):

   **For `message-list` type:**
   - User message selector (look for `[data-role="user"]`, `.user-message`, etc.)
   - Assistant message selector (look for `[data-role="assistant"]`, `.assistant-message`, etc.)
   - Content selector within messages (`.prose`, `.markdown`, `.message-content`, etc.)
   - Role attribute if present (`data-role`, `data-author`, etc.)

   **For `search-sections` type:**
   - User question selector (`.query-text`, `h1`, `[class*="query"]`, etc.)
   - AI answer selector (`.answer-text`, `.prose`, `.markdown-content`, etc.)
   - AI model selector if present (`[class*="model"]`, etc.)

5. **Sources Extraction** (if applicable):
   - Look for citation links, source references
   - Identify selectors for source lists or tiles

6. **Additional Configuration**:
   - Check if any actions are needed (click buttons, expand sections, etc.)
   - Identify any special attributes or patterns

### 5. Generate Platform Config

Based on the LLM analysis, generate a TypeScript config file following the pattern of existing platforms:

1. **File Location**: `packages/extraction-configs/src/platforms/{PLATFORM_ID}.ts`

2. **Config Structure**: Follow the `ExtractionConfig` interface:
   ```typescript
   /**
    * {PLATFORM_NAME} 平台提取設定
    *
    * @module extraction-configs/platforms/{PLATFORM_ID}
    */
   
   import type { ExtractionConfig } from '../types';
   
   /**
    * {PLATFORM_NAME} 提取設定
    */
   export const {PLATFORM_ID}Config: ExtractionConfig = {
     platform: '{PLATFORM_ID}',
     domainName: '{NAME_FROM_JSON}',
     allowedUrls: {URL_PATTERNS_FROM_JSON},
     pageTitle: {
       selector: '{SELECTOR}',
       fallbackSelectors: ['{FALLBACK1}', '{FALLBACK2}'],
     },
     contentSelector: '{CONTENT_SELECTOR}',
     extractionType: '{message-list|search-sections}',
     // ... messageConfig or sectionConfig based on type
   };
   ```

3. **Code Style**: 
   - Use JSDoc comments following existing patterns
   - Include module path in JSDoc
   - Use consistent formatting (2 spaces, single quotes if consistent with codebase)
   - Follow the exact structure of existing platform files (perplexity.ts, gemini.ts, etc.)

### 6. Update Index File

1. Read `packages/extraction-configs/src/index.ts`
2. Add export statement in the exports section: `export { {PLATFORM_ID}Config } from './platforms/{PLATFORM_ID}';`
3. Add import statement in the imports section: `import { {PLATFORM_ID}Config } from './platforms/{PLATFORM_ID}';`
4. Add entry to `PLATFORM_CONFIGS` object: `{PLATFORM_ID}: {PLATFORM_ID}Config,`

### 7. Update Platform Type (if needed)

1. Read `packages/shared-types/src/conversation.ts`
2. Check if the platform ID is already in the `Platform` type union
3. If not, add it to the union: `export type Platform = 'chatgpt' | ... | '{PLATFORM_ID}';`
4. Add display name to `PLATFORM_DISPLAY_NAMES`: `{PLATFORM_ID}: '{NAME_FROM_JSON}',`

### 8. Validate Generated Config

1. Check that all required fields are present
2. Verify selectors are valid CSS selectors
3. Ensure extraction type matches the config structure (messageConfig for message-list, sectionConfig for search-sections)
4. Check that platform ID matches the type system
5. Verify TypeScript types are correct

### 9. Report Results

Output a summary:
- Platform ID processed
- Config file created: `packages/extraction-configs/src/platforms/{PLATFORM_ID}.ts`
- Index file updated: `packages/extraction-configs/src/index.ts`
- Platform type updated: `packages/shared-types/src/conversation.ts` (if applicable)
- Any warnings or recommendations

## Example Analysis Prompt for LLM

When analyzing HTML, provide this context to the LLM:

```
Analyze the following HTML structure from {PLATFORM_NAME} and determine the extraction configuration.

Platform Info:
- ID: {PLATFORM_ID}
- Name: {PLATFORM_NAME}
- Domain: {DOMAIN}
- URL Patterns: {URL_PATTERNS}

HTML Sample:
{HTML_CONTENT}

Based on existing platform patterns:
- ChatGPT, Claude, Gemini use 'message-list' extraction type with messageConfig
- Perplexity, Phind, deepwiki use 'search-sections' extraction type with sectionConfig

Please identify:
1. Extraction type (message-list or search-sections)
2. Page title selector and fallbacks (SelectorConfig format)
3. Content container selector (string)
4. Message/section selectors based on type:
   - For message-list: userSelector, assistantSelector, contentSelector, roles
   - For search-sections: userQuestionSelector, aiAnswerSelector, aiModelSelector (optional)
5. Any source extraction selectors (if citations/links are present)
6. Any required actions (beforeExtraction, afterExtraction)

Return the configuration matching the ExtractionConfig TypeScript interface.
Reference existing platform configs for structure and naming conventions.
```

## Error Handling

- If platform directory doesn't exist: "Platform '{PLATFORM_ID}' not found in user-platforms/"
- If platform.json is invalid: "Invalid platform.json: {error details}"
- If no HTML samples: "No HTML samples found in user-platforms/{PLATFORM_ID}/samples/"
- If LLM analysis fails: "Failed to analyze HTML structure. Please check the HTML sample."
- If config generation fails: "Failed to generate config: {error details}"
- If file write fails: "Failed to write config file: {error details}"

## Notes

- The generated config should follow existing patterns closely (reference perplexity.ts, gemini.ts, deepwiki.ts)
- Prefer specific selectors over generic ones (e.g., `[data-testid="message"]` over `.message`)
- Include fallback selectors for robustness
- If the platform has sources/citations, include `sourcesExtraction` config
- Use consistent naming: `{platformId}Config` for the export name (camelCase)
- Ensure the platform ID in the config matches the directory name exactly
- The config must be valid TypeScript and match the ExtractionConfig interface
- When updating index.ts, maintain the existing code structure and formatting

