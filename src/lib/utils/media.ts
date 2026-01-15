export function resolveImageUrl(path?: string | null, bustCache = false): string | undefined {
  if (!path) return undefined;

  if (path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }

  if (path.startsWith("http")) {
    if (bustCache) {
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}?t=${Date.now()}`;
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

  if (bustCache) {
    return `${fullUrl}?t=${Date.now()}`;
  }

  return fullUrl;
}