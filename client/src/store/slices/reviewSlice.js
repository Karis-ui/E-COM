import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

export const createReview = createAsyncThunk('review/createReview', async (reviewData, { rejectWithValue }) => {
    try {
        const response = await apiClient.post("/reviews/", reviewData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchReviews = createAsyncThunk('review/fetchReviews', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get("/reviews/");
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchReview = createAsyncThunk('review/fetchReview', async (reviewId, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/reviews/${reviewId}/`);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateReview = createAsyncThunk('review/updateReview', async (reviewData, { rejectWithValue }) => {
    try {
        const response = await apiClient.put(`/reviews/${reviewData.id}/`, reviewData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const deleteReview = createAsyncThunk('review/deleteReview', async (reviewId, { rejectWithValue }) => {
    try {
        const response = await apiClient.delete(`/reviews/${reviewId}/`);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const initialState = {
    review: null,
    reviews: [],
    loading: false,
    error: null,
};

export const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.loading = false;
                state.review = action.payload;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(fetchReview.fulfilled, (state, action) => {
                state.loading = false;
                state.review = action.payload;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.loading = false;
                state.review = action.payload;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.review = action.payload;
            })
    },
});

export const { clearReview } = reviewSlice.actions;
export default reviewSlice.reducer; 