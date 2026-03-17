import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loginUser = createAsyncThunk("auth/login", async (data) => {
  const res = await axios.post("http://localhost:5000/api/auth/login", data, {
    withCredentials: true,
  });
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    token: null,
  },

  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    });
  },
});

const authReducer = authSlice.reducer;
export default authReducer;
