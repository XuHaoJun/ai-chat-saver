import * as React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface ContentOptionsSectionProps {
  includeMetadata: boolean;
  includeSources: boolean;
  downloadMedia: boolean;
  onIncludeMetadataChange: (value: boolean) => void;
  onIncludeSourcesChange: (value: boolean) => void;
  onDownloadMediaChange: (value: boolean) => void;
}

export function ContentOptionsSection({
  includeMetadata,
  includeSources,
  downloadMedia,
  onIncludeMetadataChange,
  onIncludeSourcesChange,
  onDownloadMediaChange,
}: ContentOptionsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">內容選項</h3>

      {/* 包含 Metadata */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>包含 Metadata</Label>
          <p className="text-sm text-muted-foreground">
            在 Markdown 檔案開頭加入平台、URL、匯出時間等資訊
          </p>
        </div>
        <Switch checked={includeMetadata} onCheckedChange={onIncludeMetadataChange} />
      </div>

      {/* 包含來源引用 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>包含來源引用</Label>
          <p className="text-sm text-muted-foreground">
            保留 Perplexity、Phind 等平台的搜尋結果來源連結
          </p>
        </div>
        <Switch checked={includeSources} onCheckedChange={onIncludeSourcesChange} />
      </div>

      {/* 下載媒體檔案 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>下載媒體檔案</Label>
          <p className="text-sm text-muted-foreground">
            下載對話中的圖片等媒體檔案（將產生 ZIP 壓縮檔）
          </p>
        </div>
        <Switch checked={downloadMedia} onCheckedChange={onDownloadMediaChange} />
      </div>
    </div>
  );
}

