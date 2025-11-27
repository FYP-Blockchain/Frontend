import { toast } from "sonner";

/**
 * Displays a snackbar notification using Sonner toast.
 * @param message The message to display in the snackbar.
 * @param type The type of the snackbar (e.g., 'success', 'error', 'info', 'warning').
 */
export const showSnackbar = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    case 'info':
    default:
      toast.info(message);
      break;
  }
};