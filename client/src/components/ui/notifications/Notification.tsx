import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle 
} from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

type NotificationAction = {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
};

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-error" />,
  info: <Info className="h-5 w-5 text-info" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />
};

const styles = {
  success: 'border-l-success bg-success/10',
  error: 'border-l-error bg-error/10',
  info: 'border-l-info bg-info/10',
  warning: 'border-l-warning bg-warning/10'
};

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  actions = [],
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let timer: NodeJS.Timeout;
    let startTime = Date.now();
    let remainingTime = duration;
    
    const updateProgress = () => {
      if (isPaused) return;
      
      const elapsed = Date.now() - startTime;
      const newRemainingTime = remainingTime - elapsed;
      
      if (newRemainingTime <= 0) {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Allow for exit animation
        return;
      }
      
      const newProgress = (newRemainingTime / duration) * 100;
      setProgress(newProgress);
      
      timer = setTimeout(updateProgress, 16); // ~60fps
    };
    
    timer = setTimeout(updateProgress, 16);
    
    return () => {
      clearTimeout(timer);
      remainingTime = remainingTime - (Date.now() - startTime);
      startTime = Date.now();
    };
  }, [isVisible, isPaused, id, duration, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Allow for exit animation
  };
  
  return (
    <div
      className={`
        flex flex-col w-full max-w-sm rounded-md border border-l-4 shadow-md bg-white
        transform transition-all duration-300 ease-in-out
        ${styles[type]} 
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex w-full">
        <div className="flex flex-1 items-start p-4">
          <div className="flex items-start">
            <div className="shrink-0 mt-0.5">
              {icons[type]}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={handleClose}
            className="flex h-full items-center justify-center px-3 text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      {actions && actions.length > 0 && (
        <div className="flex gap-2 px-4 pb-4 pt-0 justify-end">
          {actions.map((action, index) => {
            let buttonStyle = '';
            
            switch (action.style) {
              case 'primary':
                buttonStyle = 'bg-primary text-white hover:bg-primary-darker';
                break;
              case 'danger':
                buttonStyle = 'bg-error text-white hover:bg-error-darker';
                break;
              default: // secondary
                buttonStyle = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300';
                break;
            }
            
            return (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  if (action.style !== 'secondary') {
                    handleClose();
                  }
                }}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md transition-colors
                  ${buttonStyle}
                `}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Progress bar */}
      <div 
        className="h-1 absolute bottom-0 left-0 bg-gradient-to-r from-blue to-light-blue transition-all ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default Notification;