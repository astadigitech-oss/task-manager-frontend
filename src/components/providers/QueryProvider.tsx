"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";
import { ApiError } from "@/lib/api/interceptors";

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {

        // Data dianggap "fresh" selama 10 menit, tidak perlu refetch
        staleTime: 10 * 60 * 1000, // 10 menit
        
        // Cache disimpan lebih lama untuk mengurangi network request
        gcTime: 30 * 60 * 1000, // 30 menit
        
        refetchOnWindowFocus: false,
        
        // Gunakan cache yang ada dulu, kecuali sudah stale
        refetchOnMount: false,
        
        refetchOnReconnect: true,
        
        retry: (failureCount, error: any) => {
          // Tidak retry untuk error client (4xx)
          if (error instanceof ApiError) {
            if (error.status === 401) return false; // Unauthorized
            if (error.status === 403) return false; // Forbidden
            if (error.status === 404) return false; // Not Found
            if (error.status === 503) return false; // Service Unavailable
            if (error.status >= 400 && error.status < 500) return false;

            // Network error - retry 1x saja
            if (error.status === 0) {
              return failureCount < 1;
            }

            // Server error (5xx) - retry 2x
            if (error.status >= 500) {
              return failureCount < 2;
            }
          }
          
          if (error?.response?.status) {
            const status = error.response.status;
            
            if (status >= 400 && status < 500) return false;
            if (status === 503) return false;
            
            return failureCount < 1;
          }

          return failureCount < 1;
        },
        
        // OPTIMIZED: Retry delay lebih konservatif
        // Delay max 10 detik (dari 30 detik)
        retryDelay: (attemptIndex) => {
          return Math.min(1000 * 2 ** attemptIndex, 10000);
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}