"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") ?? "light";
    }
    return "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "grey", "dark");
    html.classList.add(theme);
  }, [theme]);

  function changeTheme(t) {
    setTheme(t);
    localStorage.setItem("theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}