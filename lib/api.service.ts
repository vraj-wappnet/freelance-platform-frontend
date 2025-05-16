// import axios, { AxiosInstance, AxiosResponse } from "axios";
// import { store } from "./store"; // Import Redux store
// import { setCredentials, logout } from "./authSlice"; // Import auth actions
// import { RootState } from "./store";

// // Define a type for API error responses
// interface ApiError {
//   message: string;
//   status?: number;
// }

// // Generic type for API responses
// interface ApiResponse<T> {
//   data: T;
//   status: number;
// }

// // Type for refresh token response
// interface RefreshTokenResponse {
//   accessToken: string;
//   refreshToken: string;
// }

// // Create an Axios instance with base configuration
// const apiClient: AxiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000, // 10 seconds timeout
// });

// // Variable to track if a refresh is in progress
// let isRefreshing = false;
// // Queue for requests waiting for refresh
// let failedRequestQueue: Array<{
//   resolve: (value: any) => void;
//   reject: (reason?: any) => void;
// }> = [];

// // Process queued requests after refresh
// const processQueue = (error: any, token: string | null = null) => {
//   failedRequestQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedRequestQueue = [];
// };

// // Add request interceptor to include accessToken
// apiClient.interceptors.request.use(
//   (config) => {
//     const state: RootState = store.getState();
//     const accessToken = state.auth.accessToken;
//     if (accessToken && config.headers) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Add response interceptor for error handling and token refresh
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const apiError: ApiError = {
//       message: error.response?.data?.message || "An error occurred",
//       status: error.response?.status,
//     };

//     // Handle 401 Unauthorized (expired accessToken)
//     if (
//       apiError.status === 401 &&
//       !originalRequest._retry &&
//       originalRequest.url !== "/auth/refresh"
//     ) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         // Queue the request until refresh is complete
//         return new Promise((resolve, reject) => {
//           failedRequestQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return apiClient(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       isRefreshing = true;

//       try {
//         const state: RootState = store.getState();
//         const refreshToken = state.auth.refreshToken;

//         if (!refreshToken) {
//           throw new Error("No refresh token available");
//         }

//         // Call refresh token endpoint
//         const response = await apiClient.post<RefreshTokenResponse>(
//           "/auth/refresh",
//           { refreshToken }
//         );

//         const { accessToken, refreshToken: newRefreshToken } = response.data;

//         // Update Redux store with new tokens
//         store.dispatch(
//           setCredentials({
//             user: state.auth.user!,
//             accessToken,
//             refreshToken: newRefreshToken,
//           })
//         );

//         // Update original request with new token
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;

//         // Process queued requests
//         processQueue(null, accessToken);

//         // Retry the original request
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed, log out and redirect
//         store.dispatch(logout());
//         processQueue(refreshError);
//         window.location.href = "/login"; // Client-side redirect
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(apiError);
//   }
// );

// class ApiService {
//   // GET request
//   static async get<T>(
//     url: string,
//     params?: Record<string, any>
//   ): Promise<ApiResponse<T>> {
//     try {
//       const response: AxiosResponse<T> = await apiClient.get(url, { params });
//       return {
//         data: response.data,
//         status: response.status,
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   // POST request
//   static async post<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
//     try {
//       const response: AxiosResponse<T> = await apiClient.post(url, data);
//       return {
//         data: response.data,
//         status: response.status,
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   // PUT request
//   static async put<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
//     try {
//       const response: AxiosResponse<T> = await apiClient.put(url, data);
//       return {
//         data: response.data,
//         status: response.status,
//       };
//     } catch (error) {
//       throw error;
//     }
//   }

//   static async patch<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
//     try {
//       const response: AxiosResponse<T> = await apiClient.patch(url, data);
//       return {
//         data: response.data,
//         status: response.status,
//       };
//     } catch (error) {
//       throw error;
//     }
//   }
//   // DELETE request
//   static async delete<T>(url: string): Promise<ApiResponse<T>> {
//     try {
//       const response: AxiosResponse<T> = await apiClient.delete(url);
//       return {
//         data: response.data,
//         status: response.status,
//       };
//     } catch (error) {
//       throw error;
//     }
//   }
// }

// export default ApiService;
// lib/apiService.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { store } from "./store";
import { setCredentials, logout } from "./authSlice";
import { RootState } from "./store";

interface ApiError {
  message: string;
  status?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

let isRefreshing = false;
let failedRequestQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedRequestQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const state: RootState = store.getState();
    const accessToken = state.auth.accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Ensure FormData requests don't have manual Content-Type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log("FormData request headers:", config.headers); // Debug
    }
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const apiError: ApiError = {
      message: error.response?.data?.message || "An error occurred",
      status: error.response?.status,
    };

    if (
      apiError.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const state: RootState = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await apiClient.post<RefreshTokenResponse>(
          "/auth/refresh",
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        store.dispatch(
          setCredentials({
            user: state.auth.user!,
            accessToken,
            refreshToken: newRefreshToken,
          }),
        );

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        processQueue(refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(apiError);
  },
);

class ApiService {
  static async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(url, { params });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("GET Error:", error);
      throw error;
    }
  }

  static async post<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(url, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("POST Error:", error);
      throw error;
    }
  }

  static async put<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(url, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("PUT Error:", error);
      throw error;
    }
  }

  static async patch<T, D extends FormData | Record<string, any>>(
    url: string,
    data: D,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.patch(url, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("PATCH Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  static async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(url);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("DELETE Error:", error);
      throw error;
    }
  }
}

export default ApiService;