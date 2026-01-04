// src/constants/api.ts

// Base URL untuk API
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://dev-taskmanager.anassyihabuddin.com';

// WebSocket Base URL
// Convert https:// ke wss:// atau http:// ke ws://
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

// Timeout untuk request
export const API_TIMEOUT = 30000; // 30 detik

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
    NOT_FOUND: 'Data yang Anda cari tidak ditemukan.',
    SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    VALIDATION_ERROR: 'Data yang Anda masukkan tidak valid.',
    TIMEOUT: 'Request timeout. Silakan coba lagi.',
    // WebSocket specific errors
    WS_CONNECTION_FAILED: 'Gagal terhubung ke server realtime.',
    WS_DISCONNECTED: 'Koneksi realtime terputus.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Login berhasil!',
    REGISTER: 'Registrasi berhasil!',
    LOGOUT: 'Logout berhasil!',
    UPDATE: 'Data berhasil diperbarui!',
    DELETE: 'Data berhasil dihapus!',
    CREATE: 'Data berhasil dibuat!',
} as const;

// WebSocket Configuration
export const WS_CONFIG = {
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY_MS: 3000,
    PING_INTERVAL_MS: 30000, // 30 seconds
} as const;