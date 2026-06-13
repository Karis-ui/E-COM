import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

const initialState = {
    user: null,
    checkoutToken: null,
    checkoutPhone: null,
    isAuthenticated: false,
    isLoading: false,
    status: "idle",
    error: null
}
export const getProfile = createAsyncThunk(
    "auth/getProfile",
    async ({ rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get("/auth/me");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (userData, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.post("/auth/register", userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.post("/auth/login", userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async ({ rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.post("/auth/logout");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const initiateCheckout = createAsyncThunk(
    "auth/initiateCheckout",
    async (phone, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.post("/auth/initiate-checkout", { phone });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const verifyOTP = createAsyncThunk(
    "auth/verifyOTP",
    async ({ phone, otp }, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.post("/auth/verify-otp", { phone, otp });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.phone = null;
            localStorage.clear();
        },
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(logoutUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.status = "succeeded";
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(initiateCheckout.pending, (state) => {
                state.isLoading = false;
            })
            .addCase(initiateCheckout.fulfilled, (state, action) => {
                state.isLoading = true;
                state.checkoutPhone = action.payload.phone;
            })
            .addCase(initiateCheckout.rejected, (state, action) => {
                state.isLoading = false;
            })
            .addCase(verifyOTP.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(getProfile.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
    }
})

export const { setUser, logout, setCheckoutPhone, setCheckoutToken } = authSlice.actions;
export default authSlice.reducer;