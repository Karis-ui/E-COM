import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

const initialState = {
    products: [],
    featuredProducts: [],
    selectedProduct: null,
    categories: [],
    isLoading: false,
    total: 0,
}

export const fetchProducts = createAsyncThunk(
    "product/fetchProducts",
    async (params, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get("/products/", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const fetchFeaturedProducts = createAsyncThunk(
    "product/fetchFeaturedProducts",
    async (params = { limit: 8 }, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get("/products/featured/", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const fetchProductsBySlug = createAsyncThunk(
    "product/fetchProductsBySlug",
    async (slug, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get(`/products/category/${slug}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const fetchCategories = createAsyncThunk(
    "product/fetchCategories",
    async ({ rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get("/products/categories/");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const fetchProductById = createAsyncThunk(
    "product/fetchProductById",
    async (id, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const fetchBrands = createAsyncThunk(
    "product/fetchBrands",
    async ({ rejectWithValue, dispatch, getState }) => {
        try {
            const response = await apiClient.get("/products/brands/");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        updateProductsLocal: (state, action) => {
            state.products = action.payload.products;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.products = action.payload.products;
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.featuredProducts = action.payload.products;
            })
            .addCase(fetchProductsBySlug.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.products = action.payload.products;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.categories = action.payload.categories;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.selectedProduct = action.payload;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.brands = action.payload.brands;
            });
    }
})

export const { updateProductsLocal } = productSlice.actions;
export default productSlice.reducer;