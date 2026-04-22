"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Baca langsung dari <html> class yang sudah diset oleh inline script
  // Ini sync — tidak perlu tunggu useEffect
  const getInitialTheme = (): Theme => {
    if (typeof window === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;

    // Matikan semua transition sementara agar ganti theme instan
    html.classList.add("no-transition");

    if (newTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    localStorage.setItem("app-theme", newTheme);

    // Re-enable transition setelah 1 frame
    requestAnimationFrame(() => {
      html.classList.remove("no-transition");
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Sync jika ada perubahan dari tab lain
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "app-theme" && e.newValue) {
        const newTheme = e.newValue as Theme;
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}