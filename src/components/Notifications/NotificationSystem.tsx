import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message?: string, action?: Notification['action']) => void;
  showError: (title: string, message?: string) => void;
  showCartSuccess: (productName: string, action?: Notification['action']) => void;
  showOrderSuccess: (orderNumber: string, total: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <FiCheck size={20} />;
    case 'error':
      return <FiX size={20} />;
    case 'warning':
      return <FiAlertCircle size={20} />;
    case 'info':
      return <FiInfo size={20} />;
    default:
      return <FiInfo size={20} />;
  }
};

const getColors = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        icon: 'text-green-400',
        title: 'text-green-400',
        message: 'text-green-300',
      };
    case 'error':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: 'text-red-400',
        title: 'text-red-400',
        message: 'text-red-300',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        icon: 'text-yellow-400',
        title: 'text-yellow-400',
        message: 'text-yellow-300',
      };
    case 'info':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        icon: 'text-brandGold',
        title: 'text-brandGold',
        message: 'text-orange-300',
      };
    default:
      return {
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/20',
        icon: 'text-gray-400',
        title: 'text-gray-400',
        message: 'text-gray-300',
      };
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const colors = getColors(notification.type);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`${colors.bg} ${colors.border} border rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm w-full`}
    >
      <div className="flex items-start space-x-3">
        <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`${colors.title} font-semibold text-sm mb-1`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`${colors.message} text-sm leading-relaxed`}>
              {notification.message}
            </p>
          )}
          
          {notification.action && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={notification.action.onClick}
              className={`${colors.title} text-sm font-medium underline mt-2 hover:no-underline`}
            >
              {notification.action.label}
            </motion.button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(notification.id)}
          className="text-gray-400 hover:text-white flex-shrink-0"
        >
          <FiX size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, action?: Notification['action']) => {
    showNotification({ type: 'success', title, message, action });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    showNotification({ type: 'error', title, message });
  }, [showNotification]);

  const showCartSuccess = useCallback((productName: string, action?: Notification['action']) => {
    showNotification({
      type: 'success',
      title: 'Додадено во кошничка!',
      message: `${productName} е успешно додаден во вашата кошничка.`,
      action,
    });
  }, [showNotification]);

  const showOrderSuccess = useCallback((orderNumber: string, total: string) => {
    showNotification({
      type: 'success',
      title: 'Нарачката е успешна!',
      message: `Нарачка #${orderNumber} за вкупно MKD ${total} е успешно креирана. Ќе ве контактираме наскоро.`,
      duration: 8000,
    });
  }, [showNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showCartSuccess,
    showOrderSuccess,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};