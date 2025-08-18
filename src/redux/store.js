import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here
import authReducer from './authSlice';
import orebiReducer from './orebiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orebi: orebiReducer,
    // Add other reducers here
  },
});
