export function getInitials(name?: string | null): string {
    if (!name || typeof name !== "string") return "?";

    const trimmed = name.trim();
    if (!trimmed) return "?";

    const words = trimmed.split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return words
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
}
