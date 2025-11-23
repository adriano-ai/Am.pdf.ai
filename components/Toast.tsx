import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100'
  };

  return (
    <div className={`flex items-center p-4 mb-3 w-full max-w-sm rounded-lg shadow-lg border ${bgColors[toast.type]} transform transition-all animate-in slide-in-from-bottom-5 fade-in duration-300`}>
      <div className="flex-shrink-0 mr-3">
        {icons[toast.type]}
      </div>
      <div className="flex-1 text-sm font-medium text-slate-800">
        {toast.message}
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="ml-3 text-slate-400 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};