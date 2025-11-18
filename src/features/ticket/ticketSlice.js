import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from '../../services/api';

const initialState = {
  loading: false,
  error: null,
  success: false,
  ticketId: null,
};

export const createTicket = createAsyncThunk(
  "ticket/createTicket",
  async (payload, thunkAPI) => {
    try {
      const response = await apiClient.post("/ticket/createTicket", payload);
      return response.data;
    } catch (err) {
      if (err.response?.data == "TICKET_ALREADY_EXISTS") {
        return thunkAPI.rejectWithValue("Ticket is already issued for this seat.")
      }
      return thunkAPI.rejectWithValue("Failed to create ticket");
    }
  }
);

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    resetTicketState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.ticketId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.ticketId = action.payload?.tokenId || null;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetTicketState } = ticketSlice.actions;
export default ticketSlice.reducer;
