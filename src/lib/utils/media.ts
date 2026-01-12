/**
 * Resolve image URL untuk diakses melalui Next.js proxy
 * @param path - Path dari backend
 * @param bustCache - Tambahkan timestamp untuk cache busting
 * @returns Proxied URL atau undefined
 */
export function resolveImageUrl(path?: string | null, bustCache = false): string | undefined {
  if (!path) return undefined;

  if (path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (bustCache) {
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}t=${Date.now()}`;
    }
    return path;
  }

  let relativePath = path;

  if (path.includes("/uploads/")) {
    relativePath = path.substring(path.indexOf("/uploads/"));
  } else if (path.includes("/profile-images/")) {
    relativePath = path.substring(path.indexOf("/profile-images/"));
  }

  relativePath = relativePath.replace(/^\//, "");

  const hasApiPrefix = relativePath.startsWith("api/");
  
  let fullUrl = hasApiPrefix ? `/${relativePath}` : `/api/${relativePath}`;

  if (bustCache) {
    const timestamp = Date.now();
    return `${fullUrl}?t=${timestamp}`;
  }

  return fullUrl;
}

/**
 * Get avatar URL dengan fallback ke default
 */
export function getAvatarUrl(
  user: { avatar?: string | null; name?: string } | null | undefined,
  bustCache = false
): string {
  if (!user?.avatar) {

    const userName = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff`;
  }

  const resolvedUrl = resolveImageUrl(user.avatar, bustCache);
  

  if (!resolvedUrl) {
    const userName = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff`;
  }

  return resolvedUrl;
}

/**
 * Get project/task image URL
 */
export function getProjectImageUrl(
  imagePath: string | null | undefined,
  bustCache = false
): string {
  const resolvedUrl = resolveImageUrl(imagePath, bustCache);
  
  if (!resolvedUrl) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  return resolvedUrl;
}