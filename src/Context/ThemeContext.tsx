// src/ThemeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

type Theme =
  | "minimalist"
  | "darkmode"
  | "retro"
  | "pastel"
  | "nature"
  | "professional"
  | "tech"
  | "sunset";

interface ThemeContextType {
  theme: Theme;
  switchTheme: (newTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("minimalist");

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
