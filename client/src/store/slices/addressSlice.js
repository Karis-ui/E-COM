import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

const initialState = {
    addresses: [],
    loading: false,
    error: null,
};

export const fetchAddresses = createAsyncThunk(
    "address/fetchAddresses",
    async (_, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get("/addresses/");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const createAddress = createAsyncThunk(
    "address/createAddress",
    async (addressData, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.post("/addresses/", addressData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const updateAddress = createAsyncThunk(
    "address/updateAddress",
    async ({ id, addressData }, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.put(`/addresses/${id}/`, addressData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const deleteAddress = createAsyncThunk(
    "address/deleteAddress",
    async (id, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.delete(`/addresses/${id}/`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const addressSlice = createSlice({
    name: "address",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses.push(action.payload);
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                const updatedAddress = action.payload;
                const index = state.addresses.findIndex(addr => addr.id === updatedAddress.id);
                if (index !== -1) {
                    state.addresses[index] = updatedAddress;
                }
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.loading = false;
                const deletedAddress = action.payload;
                state.addresses = state.addresses.filter(addr => addr.id !== deletedAddress.id);
            })
    }
})

export const { clearError } = addressSlice.actions;
export default addressSlice.reducer;