# Tasks: AI Chat Conversation Exporter Extension

**Input**: Design documents from `/specs/001-ai-chat-exporter/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not explicitly requested in specification - test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md monorepo structure:

- **apps/extension/**: Browser extension application
- **packages/html-to-markdown/**: HTML to Markdown converter
- **packages/extraction-configs/**: Platform extraction configurations
- **packages/shared-types/**: Shared TypeScript types
- **scripts/**: Build scripts

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure setup

- [x] T001 Create Turborepo monorepo structure with pnpm-workspace.yaml at project root
- [x] T002 Initialize root package.json with workspace scripts (dev, build, lint, test, typecheck)
- [x] T003 Create turbo.json with pipeline configuration for build, dev, test, lint tasks
- [x] T004 [P] Create root tsconfig.json with shared TypeScript configuration
- [x] T005 [P] Create root .eslintrc.js with TypeScript and React rules
- [x] T006 [P] Create root .prettierrc with formatting configuration
- [x] T007 [P] Create .gitignore with node_modules, dist, and build artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared packages that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Shared Types Package

- [x] T008 Initialize packages/shared-types/package.json with TypeScript dependencies
- [x] T009 [P] Create packages/shared-types/tsconfig.json
- [x] T010 [P] Create packages/shared-types/src/index.ts with package exports
- [x] T011 [P] Create packages/shared-types/src/conversation.ts with Conversation, ConversationMetadata, Platform types
- [x] T012 [P] Create packages/shared-types/src/message.ts with Message, MessageRole, Attachment, Source types
- [x] T013 [P] Create packages/shared-types/src/config.ts with ExportConfig, OutputOptions, ContentOptions types

### HTML to Markdown Package

- [x] T014 Initialize packages/html-to-markdown/package.json with dependencies
- [x] T015 [P] Create packages/html-to-markdown/tsconfig.json
- [x] T016 [P] Create packages/html-to-markdown/src/index.ts with package exports
- [x] T017 [P] Create packages/html-to-markdown/src/types.ts with converter types
- [x] T018 Create packages/html-to-markdown/src/entities.ts with HTML entity decoder
- [x] T019 [P] Create packages/html-to-markdown/src/rules/headings.ts with h1-h6 conversion
- [x] T020 [P] Create packages/html-to-markdown/src/rules/code.ts with code block and inline code conversion
- [x] T021 [P] Create packages/html-to-markdown/src/rules/lists.ts with ordered/unordered list conversion
- [x] T022 [P] Create packages/html-to-markdown/src/rules/tables.ts with table conversion
- [x] T023 [P] Create packages/html-to-markdown/src/rules/links.ts with link and image conversion
- [x] T024 [P] Create packages/html-to-markdown/src/rules/text.ts with bold/italic/strikethrough conversion
- [x] T025 Create packages/html-to-markdown/src/converter.ts with main htmlToMarkdown function applying all rules

### Extraction Configs Package

- [x] T026 Initialize packages/extraction-configs/package.json with dependencies
- [x] T027 [P] Create packages/extraction-configs/tsconfig.json
- [x] T028 [P] Create packages/extraction-configs/src/index.ts with package exports
- [x] T029 Create packages/extraction-configs/src/types.ts with ExtractionConfig, SelectorConfig, MessageExtractionConfig types
- [x] T030 Create packages/extraction-configs/src/allowed-pages.ts with EXTRACTION_ALLOWED_PAGES map

**Checkpoint**: Foundation ready - packages can be built and user story implementation can begin

---

## Phase 3: User Story 1 - Export Single Conversation (Priority: P1) 🎯 MVP

**Goal**: Users can export conversations from any supported platform (ChatGPT, Claude, Perplexity, deepwiki, Gemini, Phind) as markdown files

**Independent Test**: Visit a conversation page on any supported platform, click extension icon, verify markdown file downloads with proper formatting

### Platform Extraction Configs for User Story 1

- [x] T031 [P] [US1] Create packages/extraction-configs/src/platforms/chatgpt.ts with ChatGPT DOM selectors
- [x] T032 [P] [US1] Create packages/extraction-configs/src/platforms/claude.ts with Claude DOM selectors
- [x] T033 [P] [US1] Create packages/extraction-configs/src/platforms/perplexity.ts with Perplexity DOM selectors
- [x] T034 [P] [US1] Create packages/extraction-configs/src/platforms/phind.ts with Phind DOM selectors
- [x] T035 [P] [US1] Create packages/extraction-configs/src/platforms/deepwiki.ts with deepwiki DOM selectors per research.md
- [x] T036 [P] [US1] Create packages/extraction-configs/src/platforms/gemini.ts with Gemini DOM selectors per research.md
- [x] T037 [US1] Update packages/extraction-configs/src/index.ts to export all platform configs

### Extension App Structure for User Story 1

- [x] T038 [US1] Initialize apps/extension/package.json with React, Vite, webextension-polyfill dependencies
- [x] T039 [P] [US1] Create apps/extension/tsconfig.json
- [x] T040 [P] [US1] Create apps/extension/vite.config.ts with extension build configuration
- [x] T041 [P] [US1] Create apps/extension/public/icons/ directory with extension icons (16, 48, 128, 500 px)

### Type Definitions for User Story 1

- [x] T042 [P] [US1] Create apps/extension/src/types/extraction.ts with ExtractedContent, ExtractedData, ExtractedSection types
- [x] T043 [P] [US1] Create apps/extension/src/types/config.ts with UserConfig type
- [x] T044 [P] [US1] Create apps/extension/src/types/output.ts with ExportContent, ExportResult, OutputDestination interface

### Utility Functions for User Story 1

- [x] T045 [P] [US1] Create apps/extension/src/utils/platform.ts with platform detection from URL
- [x] T046 [P] [US1] Create apps/extension/src/utils/filename.ts with filename template formatter
- [x] T047 [P] [US1] Create apps/extension/src/utils/storage.ts with chrome.storage.sync wrapper per contracts/storage.ts
- [x] T048 [US1] Create apps/extension/src/utils/zip.ts with JSZip wrapper for multi-file export

### Content Script Extractors for User Story 1

- [x] T049 [US1] Create apps/extension/src/content/extractors/base.ts with base extractor interface
- [x] T050 [P] [US1] Create apps/extension/src/content/extractors/chatgpt.ts with ChatGPT extractor
- [x] T051 [P] [US1] Create apps/extension/src/content/extractors/claude.ts with Claude extractor
- [x] T052 [P] [US1] Create apps/extension/src/content/extractors/perplexity.ts with Perplexity extractor
- [x] T053 [P] [US1] Create apps/extension/src/content/extractors/phind.ts with Phind extractor
- [x] T054 [P] [US1] Create apps/extension/src/content/extractors/deepwiki.ts with deepwiki extractor
- [x] T055 [P] [US1] Create apps/extension/src/content/extractors/gemini.ts with Gemini extractor
- [x] T056 [US1] Create apps/extension/src/content/extractors/index.ts with extractor registry
- [x] T057 [US1] Create apps/extension/src/content/index.ts with content script message handler per contracts/messaging.ts

### Background Script for User Story 1

- [x] T058 [US1] Create apps/extension/src/background/scraping.ts with extraction orchestration logic
- [x] T059 [US1] Create apps/extension/src/background/output.ts with OutputManager and LocalDownloadDestination per contracts/output-destination.ts
- [x] T060 [US1] Create apps/extension/src/background/index.ts with service worker handling icon click and messaging

### Manifest for User Story 1 (Chrome Only for MVP)

- [x] T061 [US1] Create apps/extension/manifest.json for Chrome Manifest V3 with permissions, content scripts, service worker

**Checkpoint**: User Story 1 complete - users can export conversations from all 6 platforms on Chrome

---

## Phase 4: User Story 2 - Configure Export Settings (Priority: P2)

**Goal**: Users can customize filename templates, output format options, and content inclusion preferences

**Independent Test**: Open extension options page, modify settings, save, export a conversation, verify settings are applied

### Tailwind CSS Setup for User Story 2

- [x] T062 [US2] Create apps/extension/tailwind.config.ts with Tailwind CSS v4 configuration
- [x] T063 [P] [US2] Create apps/extension/src/styles/globals.css with Tailwind directives

### shadcn/ui Components for User Story 2

- [x] T064 [P] [US2] Create apps/extension/src/options/components/ui/button.tsx with shadcn Button component
- [x] T065 [P] [US2] Create apps/extension/src/options/components/ui/input.tsx with shadcn Input component
- [x] T066 [P] [US2] Create apps/extension/src/options/components/ui/switch.tsx with shadcn Switch component
- [x] T067 [P] [US2] Create apps/extension/src/options/components/ui/card.tsx with shadcn Card component
- [x] T068 [P] [US2] Create apps/extension/src/options/components/ui/label.tsx with shadcn Label component
- [x] T069 [P] [US2] Create apps/extension/src/options/components/ui/toast.tsx with shadcn Toast component

### Options Page Components for User Story 2

- [x] T070 [US2] Create apps/extension/src/options/components/FilenameTemplateInput.tsx with template editor and preview
- [x] T071 [P] [US2] Create apps/extension/src/options/components/OutputOptionsSection.tsx with local download and webhook toggles
- [x] T072 [P] [US2] Create apps/extension/src/options/components/ContentOptionsSection.tsx with metadata, sources, media toggles
- [x] T073 [US2] Create apps/extension/src/options/hooks/useStorage.ts with React hook for chrome.storage.sync

### Options Page Main for User Story 2

- [x] T074 [US2] Create apps/extension/src/options/App.tsx with main options page layout and form
- [x] T075 [US2] Create apps/extension/src/options/main.tsx with React entry point
- [x] T076 [US2] Create apps/extension/src/options/options.html with options page HTML shell
- [x] T077 [US2] Update apps/extension/manifest.json to add options_page entry
- [x] T078 [US2] Update apps/extension/vite.config.ts to build options page as additional entry

**Checkpoint**: User Story 2 complete - users can configure export settings via options page

---

## Phase 5: User Story 3 - Cross-Browser Compatibility (Priority: P2)

**Goal**: Extension functions identically in Chrome and Firefox browsers

**Independent Test**: Install extension in both Chrome and Firefox, perform same export operations, verify identical functionality

### Manifest Generation for User Story 3

- [x] T079 [US3] Create scripts/manifest-generator.ts with Chrome MV3 and Firefox MV2 manifest generation
- [x] T080 [US3] Create scripts/build.ts with browser-specific build orchestration

### Firefox Compatibility for User Story 3

- [x] T081 [US3] Update apps/extension/src/background/index.ts to use webextension-polyfill browser API
- [x] T082 [US3] Update apps/extension/src/content/index.ts to use webextension-polyfill browser API
- [x] T083 [US3] Update apps/extension/src/utils/storage.ts to use webextension-polyfill browser API
- [x] T084 [US3] Update apps/extension/vite.config.ts with separate Chrome and Firefox build outputs

### Packaging for User Story 3

- [x] T085 [US3] Create scripts/zip.ts with extension packaging for Chrome and Firefox stores
- [x] T086 [US3] Update root package.json with build:chrome, build:firefox, prod scripts

**Checkpoint**: User Story 3 complete - extension works identically on Chrome and Firefox

---

## Phase 6: User Story 4 - Handle Platform Interface Changes (Priority: P3)

**Goal**: Extension gracefully handles platform UI changes with clear error feedback

**Independent Test**: Simulate modified DOM structure, verify extension shows clear error message within 2 seconds

### Error Handling for User Story 4

- [x] T087 [US4] Create apps/extension/src/utils/notifications.ts with user notification helper functions
- [x] T088 [US4] Update apps/extension/src/content/extractors/base.ts with fallback selector support
- [x] T089 [US4] Update apps/extension/src/background/scraping.ts with extraction error handling and user feedback
- [x] T090 [US4] Update packages/extraction-configs/src/types.ts to add fallbackSelectors to SelectorConfig

### Fallback Selectors for User Story 4

- [x] T091 [P] [US4] Update packages/extraction-configs/src/platforms/chatgpt.ts with fallback selectors
- [x] T092 [P] [US4] Update packages/extraction-configs/src/platforms/claude.ts with fallback selectors
- [x] T093 [P] [US4] Update packages/extraction-configs/src/platforms/perplexity.ts with fallback selectors
- [x] T094 [P] [US4] Update packages/extraction-configs/src/platforms/phind.ts with fallback selectors
- [x] T095 [P] [US4] Update packages/extraction-configs/src/platforms/deepwiki.ts with fallback selectors
- [x] T096 [P] [US4] Update packages/extraction-configs/src/platforms/gemini.ts with fallback selectors

### Unsupported Page Handling for User Story 4

- [x] T097 [US4] Update apps/extension/src/background/index.ts with unsupported page notification per FR-022

**Checkpoint**: User Story 4 complete - extension handles interface changes gracefully

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T098 [P] Add webhook output destination in apps/extension/src/background/output.ts per contracts/output-destination.ts
- [x] T099 [P] Create apps/extension/src/popup/ placeholder for future popup UI
- [x] T100 Add extension icons for disabled state in apps/extension/public/icons/
- [x] T101 Final code review and lint fixes across all packages
- [x] T102 Validate quickstart.md instructions work correctly
- [x] T103 Build and test production ZIP for Chrome
- [x] T104 Build and test production ZIP for Firefox

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses storage utils from US1
- **User Story 3 (P2)**: Depends on US1 completion (needs working extension to make cross-browser)
- **User Story 4 (P3)**: Can start after US1 completion (enhances existing extractors)

### Within Each User Story

- Models/Types before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Platform extractors (T050-T055) can all run in parallel
- Platform configs (T031-T036) can all run in parallel
- UI components (T064-T069) can all run in parallel
- Fallback selector updates (T091-T096) can all run in parallel

---

## Parallel Example: User Story 1 Phase 3

```bash
# Launch all platform configs together:
Task: T031 "Create chatgpt.ts config"
Task: T032 "Create claude.ts config"
Task: T033 "Create perplexity.ts config"
Task: T034 "Create phind.ts config"
Task: T035 "Create deepwiki.ts config"
Task: T036 "Create gemini.ts config"

# Launch all extractors together:
Task: T050 "Create chatgpt.ts extractor"
Task: T051 "Create claude.ts extractor"
Task: T052 "Create perplexity.ts extractor"
Task: T053 "Create phind.ts extractor"
Task: T054 "Create deepwiki.ts extractor"
Task: T055 "Create gemini.ts extractor"

# Launch all types together:
Task: T042 "Create extraction.ts types"
Task: T043 "Create config.ts types"
Task: T044 "Create output.ts types"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test exports on all 6 platforms in Chrome
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test on Chrome → Deploy (MVP!)
3. Add User Story 2 → Test options page → Deploy
4. Add User Story 3 → Test on Firefox → Deploy
5. Add User Story 4 → Test error handling → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (background + content scripts)
   - Developer B: User Story 1 (platform extractors)
3. After US1 complete:
   - Developer A: User Story 2 (options page)
   - Developer B: User Story 3 (Firefox support)
4. Developer C can work on User Story 4 after US1

---

## Summary

| Metric                     | Count |
| -------------------------- | ----- |
| **Total Tasks**            | 104   |
| **Phase 1 (Setup)**        | 7     |
| **Phase 2 (Foundational)** | 23    |
| **Phase 3 (US1 - MVP)**    | 31    |
| **Phase 4 (US2)**          | 17    |
| **Phase 5 (US3)**          | 8     |
| **Phase 6 (US4)**          | 11    |
| **Phase 7 (Polish)**       | 7     |
| **Parallel Tasks**         | 51    |

### MVP Scope

- **Minimum viable**: Phase 1 + Phase 2 + Phase 3 (61 tasks)
- **Delivers**: Export from all 6 platforms on Chrome

### Independent Test Criteria

| User Story | Test Criteria                                                        |
| ---------- | -------------------------------------------------------------------- |
| US1        | Export conversation from each of 6 platforms, verify markdown format |
| US2        | Modify filename template, export, verify new filename used           |
| US3        | Repeat US1 tests on Firefox, verify identical output                 |
| US4        | Trigger extraction failure, verify user sees clear error within 2s   |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
