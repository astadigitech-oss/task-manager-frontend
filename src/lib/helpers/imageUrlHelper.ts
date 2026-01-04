import { API_BASE_URL } from '@/constants/api';

export const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    if (url.startsWith('data:')) {
        return url;
    }

    const baseURL = API_BASE_URL;

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const cleanBaseUrl = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

    return `${cleanBaseUrl}${cleanUrl}`;
};

export const resolveImageUrls = (urls: string[]): string[] => {
    return urls.map(resolveImageUrl);
};

/**
 * Get thumbnail URL (jika backend support thumbnail)
 */
export const getThumbnailUrl = (
    url: string,
    size: 'small' | 'medium' | 'large' = 'medium'
): string => {
    const fullUrl = resolveImageUrl(url);
    return fullUrl;
};

/**
 * Check if URL is valid image URL
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;

    if (url.startsWith('data:image/')) return true;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowerUrl = url.toLowerCase();

    return imageExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Get file size display string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};