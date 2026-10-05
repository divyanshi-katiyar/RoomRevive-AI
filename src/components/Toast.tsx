import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../hooks/useToast';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#F4F9F4] text-[#1E3B21] border-[#CDE5CF]'
                : isError
                ? 'bg-[#FDF3F2] text-[#5C1D18] border-[#F6D0CD]'
                : 'bg-[#FAF8F5] text-[#2C2926] border-[#E8E2D9]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-[#8C6849] shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
