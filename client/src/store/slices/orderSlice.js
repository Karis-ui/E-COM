import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

export const createOrder = createAsyncThunk('order/createOrder', async (orderData, { rejectWithValue }) => {
    try {
        const response = await apiClient.post("/orders/", orderData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchOrders = createAsyncThunk('order/fetchOrders', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get("/orders/");
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchOrder = createAsyncThunk('order/fetchOrder', async (orderId, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/orders/${orderId}/`);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const cancelOrder = createAsyncThunk('order/cancelOrder', async (orderId, { rejectWithValue }) => {
    try {
        const response = await apiClient.patch(`/orders/${orderId}/cancel/`);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const trackOrder = createAsyncThunk('order/trackOrder', async (orderId, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/orders/${orderId}/track/`);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const initialState = {
    order: null,
    loading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(fetchOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(trackOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
    },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;