import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

export const createEvent = createAsyncThunk(
  'events/create',
  async (eventFormData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/event/createEvent', eventFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/event/all');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/event/getDetails?eventId=${eventId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrganizerEvents = createAsyncThunk(
  'events/fetchOrganizerEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/event/my-events');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ eventId, formData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/event/update/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event');
    }
  }
);

export const deactivateEvent = createAsyncThunk(
  'events/deactivate',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/event/deactivate?eventId=${eventId}`);
      return { eventId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate event');
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    organizerEvents: [],
    currentItem: null,
    loading: false,
    error: null,
    lastCreatedEvent: null,
    lastUpdatedEvent: null,
  },
  reducers: {
    clearLastCreatedEvent: (state) => {
      state.lastCreatedEvent = null;
    },
    clearLastUpdatedEvent: (state) => {
      state.lastUpdatedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastCreatedEvent = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.lastCreatedEvent = action.payload;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })
      .addCase(fetchOrganizerEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.organizerEvents = action.payload;
      })
      .addCase(fetchOrganizerEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastUpdatedEvent = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.lastUpdatedEvent = action.payload;
        const index = state.organizerEvents.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.organizerEvents[index] = action.payload;
        }
        const allIndex = state.items.findIndex(e => e.id === action.payload.id);
        if (allIndex !== -1) {
            state.items[allIndex] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deactivateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const event = state.organizerEvents.find(e => e.id === action.payload.eventId);
        if (event) {
          event.active = false;
        }
      })
      .addCase(deactivateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLastCreatedEvent, clearLastUpdatedEvent } = eventSlice.actions;
export default eventSlice.reducer;
