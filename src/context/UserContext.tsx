"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useUsers } from "@/hooks/api/useUsers";
import { UserApi } from "@/types/api/user.api";

interface UsersContextType {
    users: UserApi[];
    isLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    } | null;
    setPage: (page: number) => void;
    refreshUsers: () => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({
    children,
    workspaceId,
}: {
    children: ReactNode;
    workspaceId?: number;
}) {
    const [page, setPage] = useState(1);

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useUsers(
        {
            workspaceId,
            page,
            limit: 20,
        },
        {
            retry: 2,
            staleTime: 3 * 60 * 1000,
        }
    );

    const users = data?.data.users || [];
    const pagination = data?.data.pagination
        ? {
            page: data.data.pagination.page,
            total: data.data.pagination.total,
            totalPages: data.data.pagination.total_pages,
            hasNext: data.data.pagination.has_next,
            hasPrev: data.data.pagination.has_prev,
        }
        : null;

    const refreshUsers = useCallback(() => {
        refetch();
    }, [refetch]);

    const errorMessage = error
        ? error instanceof Error
            ? error.message
            : "Gagal memuat data user"
        : null;

    return (
        <UsersContext.Provider
            value={{
                users,
                isLoading,
                error: errorMessage,
                pagination,
                setPage,
                refreshUsers,
            }}
        >
            {children}
        </UsersContext.Provider>
    );
}

export function useUsersContext() {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsersContext must be used within UsersProvider");
    }
    return context;
}