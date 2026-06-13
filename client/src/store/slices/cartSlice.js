import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    status: "idle",
    error: null
}

export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async ({ rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get("/cart/");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (item, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.post("/cart/", item);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const removeCartItem = createAsyncThunk(
    "cart/removeFromCart",
    async (productId, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.delete(`/cart/item/${productId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async ({ productId, quantity }, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.put(`/cart/item/${productId}`, { quantity });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async ({ rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.delete("/cart/clear");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        updateCartLocal: (state, action) => {
            state.items = action.payload.items;
            state.subtotal = action.payload.subtotal;
            state.discount = action.payload.discount;
            state.totalPrice = action.payload.totalPrice;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items;
                state.subtotal = action.payload.subtotal;
                state.discount = action.payload.discount;
                state.totalPrice = action.payload.totalPrice;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items;
                state.subtotal = action.payload.subtotal;
                state.discount = action.payload.discount;
                state.totalPrice = action.payload.totalPrice;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items;
                state.subtotal = action.payload.subtotal;
                state.discount = action.payload.discount;
                state.totalPrice = action.payload.totalPrice;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items;
                state.subtotal = action.payload.subtotal;
                state.discount = action.payload.discount;
                state.totalPrice = action.payload.totalPrice;
            })
            .addCase(clearCart.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items;
                state.subtotal = action.payload.subtotal;
                state.discount = action.payload.discount;
                state.totalPrice = action.payload.totalPrice;
            });
    }
})

export const { updateCartLocal } = cartSlice.actions;
export default cartSlice.reducer;