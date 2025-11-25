/**
 * 共享型別套件入口
 *
 * @module @ai-chat-saver/shared-types
 */

// 對話相關型別
export type { Platform, ConversationMetadata, Conversation } from './conversation';
export { PLATFORM_DISPLAY_NAMES } from './conversation';

// 訊息相關型別
export type { MessageRole, AttachmentType, Attachment, Source, Message } from './message';

// 設定相關型別
export type {
  OutputOptions,
  ContentOptions,
  ExportConfig,
  StorageSchema,
  FilenameTemplatePlaceholder,
} from './config';
export { DEFAULT_STORAGE } from './config';
