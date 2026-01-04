export const projectKeys = {
    all: ["projects"] as const,

    images: (project_id: number) =>
        [...projectKeys.all, "images", project_id] as const,
};
