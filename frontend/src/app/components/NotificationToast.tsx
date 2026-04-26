import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationToast({ message, type, isVisible, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = icons[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded border ${colors[type]} shadow-lg min-w-[300px]`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
