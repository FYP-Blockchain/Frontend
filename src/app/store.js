import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventReducer from '../features/events/eventSlice';
import ticketReducer from '../features/ticket/ticketSlice';
import walletReducer from '../features/wallet/walletReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    ticket: ticketReducer,
    wallet: walletReducer,
  },
});