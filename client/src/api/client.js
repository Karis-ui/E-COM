import axios from "axios";
import toast from "react-hot-toast";


const API_BASE_URL = process.env.REACT_APP_API_URL || "https://ktech-industries.vercel.app/api";
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 2000,
});

apiClient.interceptors.request.use(
    (request) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
    },
    (error) => {
        const message = error.response?.data?.message || error.message;
        toast.error(message);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
                    localStorage.setItem('access_token', response.data.access_token);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                    return apiClient(originalRequest);
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/checkout';
                    toast.error("Session expired. Please login again.");
                }
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/checkout';
                toast.error("Session expired. Please login again.");
            }
        }
        const message = error.response?.data?.message || error.message || "Something went wrong";
        if (!originalRequest._silent) { toast.error(message) };
        return Promise.reject(error);
    }
);

export default apiClient;
