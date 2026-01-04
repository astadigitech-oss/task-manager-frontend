"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";
import { ApiError } from "@/lib/api/interceptors";

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        
        staleTime: 5 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
        refetchOnWindowFocus: false, 
        refetchOnMount: true, 
        refetchOnReconnect: true, 
        retry: (failureCount, error: any) => {
          if (error instanceof ApiError) {
            if (error.status === 401) return false;
            if (error.status === 403) return false;
            if (error.status === 503) return false;
            if (error.status >= 400 && error.status < 500) return false;

            if (error.status === 0) {
              return failureCount < 1;
            }

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
        retryDelay: (attemptIndex) => {
          return Math.min(1000 * 2 ** attemptIndex, 30000);
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