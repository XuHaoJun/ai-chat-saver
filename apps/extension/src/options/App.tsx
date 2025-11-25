import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import { useToast } from './components/ui/toast';
import { FilenameTemplateInput } from './components/FilenameTemplateInput';
import { OutputOptionsSection } from './components/OutputOptionsSection';
import { ContentOptionsSection } from './components/ContentOptionsSection';
import { useStorage } from './hooks/useStorage';

export function App() {
  const { config, loading, saving, error, updateField, updateFields, resetToDefaults } = useStorage();
  const { showToast, ToastComponent } = useToast();

  // 處理儲存
  const handleSave = async () => {
    showToast({
      title: '設定已儲存',
      description: '您的偏好設定已成功儲存。',
      variant: 'success',
    });
  };

  // 處理重設
  const handleReset = async () => {
    await resetToDefaults();
    showToast({
      title: '設定已重設',
      description: '所有設定已恢復為預設值。',
      variant: 'default',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Chat Saver</h1>
          <p className="mt-2 text-muted-foreground">
            設定您的對話匯出偏好
          </p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* 檔名設定 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>檔名設定</CardTitle>
            <CardDescription>
              自訂匯出檔案的命名方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FilenameTemplateInput
              value={config.filenameTemplate}
              onChange={(value) => updateField('filenameTemplate', value)}
            />
          </CardContent>
        </Card>

        {/* 輸出選項 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>輸出設定</CardTitle>
            <CardDescription>
              選擇對話的匯出方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OutputOptionsSection
              localDownload={config.outputOptions.localDownload}
              webhook={config.outputOptions.webhook}
              webhookUrl={config.webhookUrl}
              onLocalDownloadChange={(value) =>
                updateFields({
                  outputOptions: { ...config.outputOptions, localDownload: value },
                })
              }
              onWebhookChange={(value) =>
                updateFields({
                  outputOptions: { ...config.outputOptions, webhook: value },
                })
              }
              onWebhookUrlChange={(value) => updateField('webhookUrl', value)}
            />
          </CardContent>
        </Card>

        {/* 內容選項 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>內容設定</CardTitle>
            <CardDescription>
              自訂匯出內容的格式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentOptionsSection
              includeMetadata={config.includeMetadata}
              includeSources={config.includeSources}
              downloadMedia={config.downloadMedia}
              onIncludeMetadataChange={(value) => updateField('includeMetadata', value)}
              onIncludeSourcesChange={(value) => updateField('includeSources', value)}
              onDownloadMediaChange={(value) => updateField('downloadMedia', value)}
            />
          </CardContent>
        </Card>

        {/* 統計資訊 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>統計資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">已匯出次數</p>
                <p className="text-2xl font-bold">{config.exportCount || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">最後使用平台</p>
                <p className="text-2xl font-bold">{config.lastUsedPlatform || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <Card>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              重設為預設值
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '儲存中...' : '儲存設定'}
            </Button>
          </CardFooter>
        </Card>

        {/* 頁尾 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            支援平台：ChatGPT、Claude、Perplexity、Phind、deepwiki、Gemini
          </p>
          <p className="mt-1">
            版本 0.1.0 |{' '}
            <a
              href="https://github.com/user/ai-chat-saver"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>

      {/* Toast */}
      {ToastComponent}
    </div>
  );
}

