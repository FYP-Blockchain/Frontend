import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import eventReducer from "../features/events/eventSlice";
import ticketReducer from "../features/ticket/ticketSlice";
import walletReducer from "../features/wallet/walletReducer";
import paymentReducer from "../features/payment/paymentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    ticket: ticketReducer,
    wallet: walletReducer,
    payment: paymentReducer,
  },
});