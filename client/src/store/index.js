import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import reviewReducer from "./slices/reviewSlice";
import orderReducer from "./slices/orderSlice";
import addressReducer from "./slices/addressSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        products: productReducer,
        review: reviewReducer,
        order: orderReducer,
        address: addressReducer,
        dashboard: dashboardReducer,
    },
});

export default store;