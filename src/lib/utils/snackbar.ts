import { toast } from 'react-toastify';

/**
 * Displays a snackbar notification with the given message.
 * @param message The message to display in the snackbar.
 * @param type The type of the snackbar (e.g., 'success', 'error', 'info', 'warning').
 */
export const showSnackbar = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  toast(message, {
    type,
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};