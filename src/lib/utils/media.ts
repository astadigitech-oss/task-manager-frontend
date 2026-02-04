export function resolveImageUrl(
  path?: string | null, 
  bustCache = false,
  updatedAt?: string | Date
): string | undefined {
  if (!path) return undefined;

  if (!path.includes('/') && !path.startsWith('http') && !path.startsWith('blob:') && !path.startsWith('data:')) {
    console.warn(`Invalid image path (filename only): ${path}`);
    return undefined;
  }

  if (path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }

  if (path.startsWith("http")) {
    if (bustCache && updatedAt) {
      // Gunakan timestamp dari updatedAt, bukan Date.now()
      const timestamp = new Date(updatedAt).getTime();
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}t=${timestamp}`;
    }
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

  let relativePath = path;

  if (path.includes("/uploads/")) {
    relativePath = path.substring(path.indexOf("/uploads/"));
  } else if (path.includes("/profile-images/")) {
    relativePath = path.substring(path.indexOf("/profile-images/"));
  }

  relativePath = relativePath.replace(/^\//, "");

  let fullUrl = `${baseUrl}/${relativePath}`;

  if (bustCache && updatedAt) {
    const timestamp = new Date(updatedAt).getTime();
    return `${fullUrl}?t=${timestamp}`;
  }

  return fullUrl;
}