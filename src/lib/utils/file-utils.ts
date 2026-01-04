export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

export const isPDFFile = (file: File): boolean => {
  return file.type === "application/pdf";
};

export const getFileIcon = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
    return "🖼️";
  } else if (ext === "pdf") {
    return "📄";
  } else if (["doc", "docx"].includes(ext || "")) {
    return "📝";
  } else if (["xls", "xlsx"].includes(ext || "")) {
    return "📊";
  } else if (["zip", "rar", "7z"].includes(ext || "")) {
    return "🗜️";
  }
  
  return "📎";
};

export const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
};

export const openFileInNewTab = (file: File): void => {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank");
};

