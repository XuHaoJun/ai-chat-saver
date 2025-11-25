import * as React from 'react';
import type { StorageSchema } from '@ai-chat-saver/shared-types';
import { getStorage, setStorage, onStorageChange, DEFAULT_STORAGE } from '@/utils/storage';

/**
 * React Hook for chrome.storage.sync
 */
export function useStorage() {
  const [config, setConfig] = React.useState<StorageSchema>(DEFAULT_STORAGE);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 載入設定
  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const stored = await getStorage();
        setConfig(stored);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入設定失敗');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 監聽變更
  React.useEffect(() => {
    const unsubscribe = onStorageChange((changes) => {
      setConfig((prev) => {
        const updated = { ...prev };
        for (const [key, change] of Object.entries(changes)) {
          if (change?.newValue !== undefined) {
            (updated as Record<string, unknown>)[key] = change.newValue;
          }
        }
        return updated;
      });
    });

    return unsubscribe;
  }, []);

  // 更新單一欄位
  const updateField = React.useCallback(
    async <K extends keyof StorageSchema>(key: K, value: StorageSchema[K]) => {
      try {
        setSaving(true);
        setError(null);

        // 樂觀更新
        setConfig((prev) => ({ ...prev, [key]: value }));

        // 儲存到 storage
        await setStorage({ [key]: value });
      } catch (err) {
        setError(err instanceof Error ? err.message : '儲存設定失敗');
        // 回復原值
        const stored = await getStorage([key]);
        setConfig((prev) => ({ ...prev, [key]: stored[key] }));
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // 更新多個欄位
  const updateFields = React.useCallback(async (updates: Partial<StorageSchema>) => {
    try {
      setSaving(true);
      setError(null);

      // 樂觀更新
      setConfig((prev) => ({ ...prev, ...updates }));

      // 儲存到 storage
      await setStorage(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存設定失敗');
      // 重新載入
      const stored = await getStorage();
      setConfig(stored);
    } finally {
      setSaving(false);
    }
  }, []);

  // 重設為預設值
  const resetToDefaults = React.useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      await setStorage(DEFAULT_STORAGE);
      setConfig(DEFAULT_STORAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重設設定失敗');
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    config,
    loading,
    saving,
    error,
    updateField,
    updateFields,
    resetToDefaults,
  };
}

