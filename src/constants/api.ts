export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';;

export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000';

export const API_TIMEOUT = 30000;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
    NOT_FOUND: 'Data yang Anda cari tidak ditemukan.',
    SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    VALIDATION_ERROR: 'Data yang Anda masukkan tidak valid.',
    TIMEOUT: 'Request timeout. Silakan coba lagi.',
    WS_CONNECTION_FAILED: 'Gagal terhubung ke server realtime.',
    WS_DISCONNECTED: 'Koneksi realtime terputus.',
} as const;

export const SUCCESS_MESSAGES = {
    LOGIN: 'Login berhasil!',
    REGISTER: 'Registrasi berhasil!',
    LOGOUT: 'Logout berhasil!',
    UPDATE: 'Data berhasil diperbarui!',
    DELETE: 'Data berhasil dihapus!',
    CREATE: 'Data berhasil dibuat!',
} as const;

export const WS_CONFIG = {
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY_MS: 3000,
    PING_INTERVAL_MS: 30000,
} as const;