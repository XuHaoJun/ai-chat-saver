import * as React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { formatFilename, validateFilenameTemplate } from '@/utils/filename';

interface FilenameTemplateInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PLACEHOLDERS = [
  { code: '%Y', description: '年（四位數）', example: '2025' },
  { code: '%M', description: '月（兩位數）', example: '01' },
  { code: '%D', description: '日（兩位數）', example: '27' },
  { code: '%h', description: '時（24 小時制）', example: '14' },
  { code: '%m', description: '分', example: '30' },
  { code: '%s', description: '秒', example: '00' },
  { code: '%t', description: 'Unix 時間戳', example: '1706362200' },
  { code: '%W', description: '平台名稱', example: 'ChatGPT' },
  { code: '%H', description: '主機名稱', example: 'chatgpt.com' },
  { code: '%T', description: '對話標題', example: '我的對話' },
];

export function FilenameTemplateInput({ value, onChange }: FilenameTemplateInputProps) {
  const [isValid, setIsValid] = React.useState(true);

  // 計算預覽
  const preview = React.useMemo(() => {
    return formatFilename(value, {
      title: '我的對話',
      platform: 'ChatGPT',
      hostname: 'chatgpt.com',
      timestamp: new Date(),
    });
  }, [value]);

  // 驗證
  React.useEffect(() => {
    setIsValid(validateFilenameTemplate(value));
  }, [value]);

  const handleInsertPlaceholder = (code: string) => {
    onChange(value + code);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="filename-template">檔名範本</Label>
        <Input
          id="filename-template"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="%Y-%M-%D_%h-%m-%s_%W_%T"
          className={!isValid ? 'border-destructive' : ''}
        />
        {!isValid && (
          <p className="text-sm text-destructive">請輸入有效的檔名範本</p>
        )}
      </div>

      {/* 預覽 */}
      <div className="rounded-md bg-muted p-3">
        <p className="text-sm text-muted-foreground">預覽：</p>
        <p className="font-mono text-sm">{preview}.md</p>
      </div>

      {/* 佔位符說明 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">可用佔位符（點擊插入）：</p>
        <div className="flex flex-wrap gap-2">
          {PLACEHOLDERS.map(({ code, description }) => (
            <button
              key={code}
              type="button"
              onClick={() => handleInsertPlaceholder(code)}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-mono hover:bg-secondary/80"
              title={description}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* 詳細說明 */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          佔位符說明
        </summary>
        <div className="mt-2 space-y-1 text-muted-foreground">
          {PLACEHOLDERS.map(({ code, description, example }) => (
            <div key={code} className="flex gap-2">
              <code className="font-mono">{code}</code>
              <span>- {description}（例：{example}）</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

