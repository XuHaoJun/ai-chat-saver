import * as React from 'react';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
  open?: boolean;
  onClose?: () => void;
}

const toastVariants = {
  default: 'bg-background border',
  success: 'bg-green-50 border-green-200 text-green-800',
  destructive: 'bg-destructive text-destructive-foreground',
};

export function Toast({ title, description, variant = 'default', open, onClose }: ToastProps) {
  const [visible, setVisible] = React.useState(open);

  React.useEffect(() => {
    setVisible(open);
    if (open) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex w-full max-w-md items-center gap-4 rounded-lg p-4 shadow-lg ${toastVariants[variant]}`}
      role="alert"
    >
      <div className="flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="text-current opacity-70 hover:opacity-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// Simple toast hook
export function useToast() {
  const [toast, setToast] = React.useState<ToastProps | null>(null);

  const showToast = React.useCallback((props: Omit<ToastProps, 'open' | 'onClose'>) => {
    setToast({ ...props, open: true });
  }, []);

  const hideToast = React.useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent: toast ? <Toast {...toast} onClose={hideToast} /> : null,
  };
}
