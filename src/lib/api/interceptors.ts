import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { showErrorToast } from "@/lib/helpers/toast-helpers";
import { ERROR_MESSAGES } from "@/constants/api";

export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// ==========================================
// FLAG UNTUK PREVENT DUPLICATE TOAST
// ==========================================
let isHandling503 = false;
let isHandlingNetworkError = false;

const extractMessageFromHTML = (html: string): string => {
    const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
    if (pMatch && pMatch[1]) {
        return pMatch[1].trim();
    }

    const h2Match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
    if (h2Match && h2Match[1]) {
        return h2Match[1].trim();
    }

    return "Server sedang sibuk atau dalam maintenance. Silakan coba lagi nanti.";
};

export const setupRequestInterceptor = (axiosInstance: AxiosInstance) => {
    axiosInstance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = useAuthStore.getState().token;
            
            
            if (token) {
                config.headers = config.headers ?? {};
                config.headers["Authorization"] = `Bearer ${token}`;
            } else {
            }

            if (config.data instanceof FormData) {
                if (config.headers["Content-Type"]) {
                    delete config.headers["Content-Type"];
                }
            }

            if (process.env.NODE_ENV === "development") {
                console.log("Request:", {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    hasToken: !!config.headers["Authorization"],
                    data: config.data instanceof FormData
                        ? "FormData (cannot display)"
                        : config.data,
                });

                if (config.data instanceof FormData) {
                    console.log("FormData entries:");
                    for (let pair of config.data.entries()) {
                        console.log(`  ${pair[0]}:`, pair[1]);
                    }
                }
            }
            return config;
        },
        (error: AxiosError) => {
            return Promise.reject(error);
        }
    );
};

export const setupResponseInterceptor = (axiosInstance: AxiosInstance) => {
    axiosInstance.interceptors.response.use(
        (response) => {
            if (process.env.NODE_ENV === "development") {
                console.log(" Response:", {
                    status: response.status,
                    url: response.config.url,
                    data: response.data,
                });
            }
            return response;
        },
        (error: AxiosError<any>) => {

            if (error.response) {
                const responseData = error.response.data;
                const isHTMLResponse = typeof responseData === 'string' &&
                    (responseData.includes('<!DOCTYPE html') ||
                        responseData.includes('<html'));

                if (isHTMLResponse && error.response.status === 503) {
                    if (!isHandling503) {
                        isHandling503 = true;
                        const displayMessage = extractMessageFromHTML(responseData);
                        showErrorToast(displayMessage);
                        setTimeout(() => {
                            isHandling503 = false;
                        }, 5000);
                    }
                    return Promise.reject(
                        new ApiError(503, "Service Unavailable", responseData)
                    );
                }
            }

            // ==========================================
            // NETWORK ERROR
            // ==========================================
            if (!error.response) {
                console.error("Network Error:", error.message);

                if (!isHandlingNetworkError) {
                    isHandlingNetworkError = true;
                    showErrorToast(ERROR_MESSAGES.NETWORK_ERROR);
                    setTimeout(() => {
                        isHandlingNetworkError = false;
                    }, 5000);
                }

                return Promise.reject(
                    new ApiError(0, ERROR_MESSAGES.NETWORK_ERROR)
                );
            }

            const status = error.response.status;
            const message =
                error.response.data?.message ||
                error.message ||
                "Terjadi kesalahan";

            if (process.env.NODE_ENV === "development") {
                console.error(" Error Response:", {
                    status,
                    url: error.config?.url,
                    message,
                    data: error.response.data,
                });
            }

            // ==========================================
            // 401 UNAUTHORIZED - Logout & Redirect
            // ==========================================
            if (status === 401) {
                const isLoginRequest =
                    error.config?.url?.includes("/auth/login");

                if (isLoginRequest) {
                    return Promise.reject(
                        new ApiError(
                            status,
                            error.response.data?.message ||
                            "Email atau password salah",
                            error.response.data
                        )
                    );
                }

                console.warn(" 401 Unauthorized - Logging out...");
                useAuthStore.getState().logout();

                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login";
                }

                return Promise.reject(
                    new ApiError(status, "Sesi Anda telah berakhir")
                );
            }

            // ==========================================
            // 403 FORBIDDEN - Access Denied
            // ==========================================
            if (status === 403) {
                console.error(" 403 Forbidden:", {
                    url: error.config?.url,
                    message: error.response.data?.message,
                    error: error.response.data?.error,
                    data: error.response.data
                });

                const forbiddenMessage = 
                    error.response.data?.error ||
                    error.response.data?.message || 
                    "Anda tidak memiliki akses ke resource ini";

                const isQueryRequest = error.config?.url?.includes('/api/');
                if (!isQueryRequest) {
                    showErrorToast(forbiddenMessage);
                }

                return Promise.reject(
                    new ApiError(status, forbiddenMessage, error.response.data)
                );
            }

            // ==========================================
            // 503 SERVICE UNAVAILABLE
            // ==========================================
            if (status === 503) {
                if (!isHandling503) {
                    isHandling503 = true;

                    let displayMessage = "Server sedang sibuk atau dalam maintenance. Silakan coba lagi nanti.";

                    if (typeof error.response.data === 'string' &&
                        (error.response.data.includes('<p>') ||
                            error.response.data.includes('<html'))) {
                        displayMessage = extractMessageFromHTML(error.response.data);
                    } else if (error.response.data?.message) {
                        displayMessage = error.response.data.message;
                    }

                    showErrorToast(displayMessage);

                    setTimeout(() => {
                        isHandling503 = false;
                    }, 5000);
                }

                return Promise.reject(
                    new ApiError(status, "Service Unavailable", error.response.data)
                );
            }

            // ==========================================
            // ALL OTHER ERRORS
            // ==========================================
            return Promise.reject(
                new ApiError(status, message, error.response.data)
            );
        }
    );
};



export const setupInterceptors = (axiosInstance: AxiosInstance) => {
    setupRequestInterceptor(axiosInstance);
    setupResponseInterceptor(axiosInstance);
};