import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Async thunk for creating payment intent with backend
export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async ({ eventId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/payments/createIntent", {
        eventId: String(eventId),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment intent"
      );
    }
  }
);

// Async thunk for confirming payment with stripe
export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async ({ stripe, clientSecret, cardElement }, { rejectWithValue }) => {
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Add billing details here
            },
          },
        }
      );

      if (error) {
        return rejectWithValue(error.message);
      }

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      return rejectWithValue("Payment confirmation failed");
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  clientSecret: null,
  paymentIntentId: null,
  paymentStatus: null,
  isPaymentSuccessful: false,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      return initialState;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.clientSecret = null;
      })
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntentId = action.payload.paymentIntentId;
        state.paymentStatus = action.payload.status;
        state.isPaymentSuccessful = action.payload.status === "succeeded";
        state.error = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isPaymentSuccessful = false;
      });
  },
});

export const { resetPaymentState, clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
