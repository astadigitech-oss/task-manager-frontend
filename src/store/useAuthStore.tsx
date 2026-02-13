import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types/api/user.api";

export interface AttendanceFormData {
  activity: string;
  obstacle: string;
  images: File[];
  previews: string[];
  submittedAt: string; // ISO timestamp
  workspaceId: number;
}

// Draft = isian yang belum disubmit (disimpan sementara)
export interface AttendanceDraftData {
  activity: string;
  obstacle: string;
  previews: string[]; // base64 previews (bisa di-persist)
  savedAt: string;    // ISO timestamp – untuk validasi "masih hari ini?"
  workspaceId: number;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  profileBootstrapped?: boolean;

  defaultWorkspaceId: number | null;

  // Submitted attendance (setelah berhasil submit)
  todayAttendance: Record<number, AttendanceFormData>; // key: workspaceId

  // Draft attendance (sedang diisi, belum submit)
  attendanceDraft: Record<number, AttendanceDraftData>; // key: workspaceId

  login: (data: {
    user: UserProfile;
    token: string;
    defaultWorkspaceId?: number;
  }) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setHydrated: (value: boolean) => void;

  setDefaultWorkspaceId: (workspaceId: number) => void;

  // Submitted attendance actions
  saveAttendance: (workspaceId: number, data: Omit<AttendanceFormData, "submittedAt" | "workspaceId">) => void;
  getAttendance: (workspaceId: number) => AttendanceFormData | null;
  hasSubmittedToday: (workspaceId: number) => boolean;
  clearExpiredAttendance: () => void;

  // Draft actions
  saveDraft: (workspaceId: number, data: Omit<AttendanceDraftData, "savedAt" | "workspaceId">) => void;
  getDraft: (workspaceId: number) => AttendanceDraftData | null;
  clearDraft: (workspaceId: number) => void;
  clearExpiredDrafts: () => void;
}

// ─── Helper: cek apakah timestamp masih hari ini ──────────────────────────────
function isToday(isoTimestamp: string): boolean {
  const saved = new Date(isoTimestamp);
  const now = new Date();
  return (
    saved.getFullYear() === now.getFullYear() &&
    saved.getMonth() === now.getMonth() &&
    saved.getDate() === now.getDate()
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      defaultWorkspaceId: null,
      todayAttendance: {},
      attendanceDraft: {},

      setHydrated: (value: boolean) => set({ isHydrated: value }),

      login: ({ user, token, defaultWorkspaceId }) => {
        set({
          user,
          token,
          isAuthenticated: true,
          defaultWorkspaceId: defaultWorkspaceId ?? null,
        });

        if (typeof window !== "undefined") {
          document.cookie = `token=Bearer ${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
          document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
          window.dispatchEvent(new Event("user-logged-in"));
        }
      },

      updateUser: (updatedFields) => {
        set((state) => {
          if (!state.user) return state;

          const hasChanges = Object.keys(updatedFields).some(
            (key) =>
              updatedFields[key as keyof typeof updatedFields] !==
              state.user![key as keyof UserProfile]
          );

          if (!hasChanges) return state;

          return { user: { ...state.user, ...updatedFields } };
        });
      },

      setDefaultWorkspaceId: (workspaceId: number) => {
        set({ defaultWorkspaceId: workspaceId });
      },

      // ── Submitted attendance ──────────────────────────────────────────────────

      saveAttendance: (workspaceId, data) => {
        set((state) => ({
          todayAttendance: {
            ...state.todayAttendance,
            [workspaceId]: {
              ...data,
              submittedAt: new Date().toISOString(),
              workspaceId,
            },
          },
          // Hapus draft setelah berhasil submit
          attendanceDraft: (() => {
            const next = { ...state.attendanceDraft };
            delete next[workspaceId];
            return next;
          })(),
        }));
      },

      getAttendance: (workspaceId) => {
        const attendance = get().todayAttendance[workspaceId];
        if (!attendance) return null;
        return isToday(attendance.submittedAt) ? attendance : null;
      },

      hasSubmittedToday: (workspaceId) => {
        return get().getAttendance(workspaceId) !== null;
      },

      clearExpiredAttendance: () => {
        const filtered: Record<number, AttendanceFormData> = {};

        Object.entries(get().todayAttendance).forEach(([id, attendance]) => {
          if (isToday(attendance.submittedAt)) {
            filtered[Number(id)] = attendance;
          }
        });

        set({ todayAttendance: filtered });
      },

      // ── Draft attendance ──────────────────────────────────────────────────────

      /**
       * Simpan draft form (dipanggil saat user mengetik / mengganti foto).
       * File[] tidak bisa di-persist, jadi hanya previews (base64) yang disimpan.
       */
      saveDraft: (workspaceId, data) => {
        set((state) => ({
          attendanceDraft: {
            ...state.attendanceDraft,
            [workspaceId]: {
              ...data,
              savedAt: new Date().toISOString(),
              workspaceId,
            },
          },
        }));
      },

      /**
       * Ambil draft hari ini untuk workspace tertentu.
       * Mengembalikan null jika tidak ada atau sudah expired (beda hari).
       */
      getDraft: (workspaceId) => {
        const draft = get().attendanceDraft[workspaceId];
        if (!draft) return null;
        return isToday(draft.savedAt) ? draft : null;
      },

      /** Hapus draft workspace tertentu (setelah submit atau user sengaja reset). */
      clearDraft: (workspaceId) => {
        set((state) => {
          const next = { ...state.attendanceDraft };
          delete next[workspaceId];
          return { attendanceDraft: next };
        });
      },

      /** Hapus semua draft yang sudah beda hari (dipanggil saat rehydrate / midnight). */
      clearExpiredDrafts: () => {
        const filtered: Record<number, AttendanceDraftData> = {};

        Object.entries(get().attendanceDraft).forEach(([id, draft]) => {
          if (isToday(draft.savedAt)) {
            filtered[Number(id)] = draft;
          }
        });

        set({ attendanceDraft: filtered });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          document.cookie = `role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          defaultWorkspaceId: null,
          todayAttendance: get().todayAttendance,
          attendanceDraft: get().attendanceDraft,
        });

        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new Event("user-logged-out"));
          } catch (e) {
            console.error("Error during logout cleanup:", e);
          }
        }
      },
    }),
    {
      name: "auth-storage",
      // File[] tidak bisa di-serialize → exclude dari persist
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        defaultWorkspaceId: state.defaultWorkspaceId,
        todayAttendance: state.todayAttendance,
        // Simpan draft TANPA field images (karena File[] tidak serializable)
        attendanceDraft: Object.fromEntries(
          Object.entries(state.attendanceDraft).map(([id, draft]) => [
            id,
            {
              activity: draft.activity,
              obstacle: draft.obstacle,
              previews: draft.previews,
              savedAt: draft.savedAt,
              workspaceId: draft.workspaceId,
            },
          ])
        ),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);

          if (state.token && typeof window !== "undefined") {
            document.cookie = `token=Bearer ${state.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
          }

          // Bersihkan data expired saat aplikasi dibuka
          state.clearExpiredAttendance();
          state.clearExpiredDrafts();
        }
      },
    }
  )
);