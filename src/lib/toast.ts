import { toast as sonnerToast } from "sonner";

/**
 * Global Toast Utility
 * Provides standardized, clean toast notifications across the application.
 */
export const toast = {
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, options);
  },
  error: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.error(message, options);
  },
  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, options);
  },
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, options);
  },
  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, options);
  },
  promise: <T>(
    promise: Promise<T>,
    data: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, data);
  },
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

export default toast;
