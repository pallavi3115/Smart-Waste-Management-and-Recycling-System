import toast from 'react-hot-toast';

// Success toast
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    icon: '🎉',
    duration: 3000,
    position: 'top-right',
    ...options,
  });
};

// Error toast
export const showError = (message, options = {}) => {
  toast.error(message, {
    icon: '❌',
    duration: 4000,
    position: 'top-right',
    ...options,
  });
};

// Info toast
export const showInfo = (message, options = {}) => {
  toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
    ...options,
  });
};

// Warning toast
export const showWarning = (message, options = {}) => {
  toast(message, {
    icon: '⚠️',
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#f59e0b',
      color: '#fff',
    },
    ...options,
  });
};

// Loading toast (returns toast ID for updating)
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
    ...options,
  });
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Promise toast (for async operations)
export const showPromiseToast = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    },
    {
      position: 'top-right',
      ...options,
    }
  );
};

// Custom toast
export const showCustomToast = (message, options = {}) => {
  toast.custom(message, options);
};