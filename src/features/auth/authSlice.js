import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api'; 

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data; 
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/signin', userData);
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

const getUserDataFromStorage = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: getUserDataFromStorage(),  
    loading: false,
    error: null,
    successMessage: '',
  },
  reducers: { 
    logout: (state) => {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      state.currentUser = null;
    },
},
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export const { logout } = authSlice.actions;
export default authSlice.reducer;