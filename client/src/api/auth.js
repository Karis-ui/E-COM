import apiClient from "./client";

export const authAPI = {
    initoiateCheckout: (phone) => apiClient.post('/checkout/initiate', { phone }),
    verifyOTP: (phone, otp) => apiClient.post('/checkout/verify', { phone, otp }),
    getProfile: () => apiClient.get('/auth/me'),
    updateProfile: (data) => apiClient.put('/auth/profile', { data }),
    changePassword: (old, newPass, confirmPass) => apiClient.post('/auth/change/password', { old: old, newPass: newPass, confirmPass: confirmPass }),
    forgotPassword: (identifier) => apiClient.post('/auth/forgot-password', { identifier }),
    verifyResetOTP: (identifier, otp) => apiClient.post('/auth/verify-reset-otp', { identifier, otp }),
    resertPassword: (identifier, otp, newPass) => apiClient.post('/auth/reset-password', { identifier, otp, newPass: newPass }),
    refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        return Promise.resolve();
    }
};