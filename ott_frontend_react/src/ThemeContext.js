import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * ThemeContext provides global theme ("light","dark") state and setter.
 * Use via: const {theme, setTheme, toggleTheme} = useTheme();
 */
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

// PUBLIC_INTERFACE
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // Persist theme in localStorage, and apply to document root
  useEffect(() => {
    const saved = window.localStorage.getItem("app_theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("app_theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useTheme() {
  return useContext(ThemeContext);
}
