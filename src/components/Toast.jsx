import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleXmark, faInfoCircle, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import './Toast.css';
import { useTranslation } from 'react-i18next';

// نظام إدارة للـ toasts
export const toastManager = {
  toasts: [],
  listeners: [],
  
  show(message, type = 'success', actionType = null) {
    const id = Date.now();
    const toast = { id, message, type, actionType };
    this.toasts.push(toast);
    this.notify();
    
    // إزالة الإشعار تلقائيًا بعد فترة
    setTimeout(() => {
      this.dismiss(id);
    }, 3000);
    
    return id;
  },
  
  dismiss(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  },
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  notify() {
    this.listeners.forEach(listener => listener(this.toasts));
  }
};

// دالات مساعدة لعرض أنواع مختلفة من الإشعارات
export const showToast = {
  success: (message) => toastManager.show(message, 'success'),
  error: (message) => toastManager.show(message, 'error'),
  info: (message) => toastManager.show(message, 'info'),
  added: (message) => toastManager.show(message, 'success', 'add'),
  edited: (message) => toastManager.show(message, 'success', 'edit'),
  deleted: (message) => toastManager.show(message, 'success', 'delete'),
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);
  const { i18n } = useTranslation();
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((updatedToasts) => {
      setToasts([...updatedToasts]);
    });
    
    return unsubscribe;
  }, []);

  const getIcon = (type, actionType) => {
    if (actionType === 'add') return faPlus;
    if (actionType === 'edit') return faEdit;
    if (actionType === 'delete') return faTrash;
    
    switch (type) {
      case 'success': return faCheckCircle;
      case 'error': return faCircleXmark;
      default: return faInfoCircle;
    }
  };

  // تحديد لون الخلفية حسب نوع العملية
  const getToastClass = (type, actionType) => {
    let baseClass = `toast-item ${type}`;
    
    if (actionType) {
      baseClass += ` action-${actionType}`;
    }
    
    return baseClass;
  };

  // إعادة ترتيب الـ toasts من الأحدث للأقدم
  const sortedToasts = [...toasts].reverse();

  return (
    <div className={`toast-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {sortedToasts.map((toast) => (
        <div 
          key={toast.id}
          className={getToastClass(toast.type, toast.actionType)}
          onClick={() => toastManager.dismiss(toast.id)}
        >
          <div className="toast-icon">
            <FontAwesomeIcon icon={getIcon(toast.type, toast.actionType)} />
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
