import { useStorageState } from "@/hooks/useStorageState";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Appearance, useColorScheme } from "react-native";

// Types
type ThemeType = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeType;
  currentTheme: "light" | "dark";
  setTheme: (theme: ThemeType) => void;
}

// Default context value
const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  currentTheme: "dark",
  setTheme: () => {},
});

// Hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() as "light" | "dark";
  const [[, storedTheme], setStoredTheme] = useStorageState("theme");

  const [theme, setThemeState] = useState<ThemeType>("system");
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    systemColorScheme || "dark"
  );

  // Load stored theme on first render
  useEffect(() => {
    if (storedTheme) {
      setThemeState(storedTheme as ThemeType);
    }
  }, [storedTheme]);

  // Update currentTheme based on theme value or system preference
  useEffect(() => {
    if (theme === "system") {
      setCurrentTheme(systemColorScheme || "dark");
    } else {
      setCurrentTheme(theme);
    }
  }, [theme, systemColorScheme]);

  // Respond to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === "system") {
        setCurrentTheme((colorScheme as "light" | "dark") || "dark");
      }
    });
    return () => subscription.remove();
  }, [theme]);

  // Setter function
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
