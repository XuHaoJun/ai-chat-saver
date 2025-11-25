import * as React from 'react';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { validateWebhookUrl } from '@/utils/storage';

interface OutputOptionsSectionProps {
  localDownload: boolean;
  webhook: boolean;
  webhookUrl: string;
  onLocalDownloadChange: (value: boolean) => void;
  onWebhookChange: (value: boolean) => void;
  onWebhookUrlChange: (value: string) => void;
}

export function OutputOptionsSection({
  localDownload,
  webhook,
  webhookUrl,
  onLocalDownloadChange,
  onWebhookChange,
  onWebhookUrlChange,
}: OutputOptionsSectionProps) {
  const [webhookUrlError, setWebhookUrlError] = React.useState<string | null>(null);

  // 驗證 Webhook URL
  React.useEffect(() => {
    if (webhook && webhookUrl && !validateWebhookUrl(webhookUrl)) {
      setWebhookUrlError('請輸入有效的 URL（需以 http:// 或 https:// 開頭）');
    } else if (webhook && !webhookUrl) {
      setWebhookUrlError('啟用 Webhook 時需要設定 URL');
    } else {
      setWebhookUrlError(null);
    }
  }, [webhook, webhookUrl]);

  // 確保至少有一個輸出選項啟用
  const handleLocalDownloadChange = (checked: boolean) => {
    if (!checked && !webhook) {
      return; // 不允許同時停用兩個選項
    }
    onLocalDownloadChange(checked);
  };

  const handleWebhookChange = (checked: boolean) => {
    if (!checked && !localDownload) {
      return; // 不允許同時停用兩個選項
    }
    onWebhookChange(checked);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">輸出選項</h3>

      {/* 本地下載 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>本地下載</Label>
          <p className="text-sm text-muted-foreground">
            將對話匯出為 Markdown 或 ZIP 檔案下載到本機
          </p>
        </div>
        <Switch
          checked={localDownload}
          onCheckedChange={handleLocalDownloadChange}
          disabled={!webhook} // 如果 webhook 關閉，本地下載不可關閉
        />
      </div>

      {/* Webhook */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Webhook</Label>
            <p className="text-sm text-muted-foreground">將對話內容傳送到指定的 Webhook URL</p>
          </div>
          <Switch
            checked={webhook}
            onCheckedChange={handleWebhookChange}
            disabled={!localDownload} // 如果本地下載關閉，webhook 不可關閉
          />
        </div>

        {webhook && (
          <div className="ml-0 space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => onWebhookUrlChange(e.target.value)}
              placeholder="https://example.com/webhook"
              className={webhookUrlError ? 'border-destructive' : ''}
            />
            {webhookUrlError && <p className="text-sm text-destructive">{webhookUrlError}</p>}
          </div>
        )}
      </div>

      {/* 提示 */}
      <p className="text-xs text-muted-foreground">* 至少需要啟用一個輸出選項</p>
    </div>
  );
}
