import { createContext } from "react";
import { type ThemeType } from "../styles/theme";

// --- Theme Context ---
interface ThemeContextData {
  theme: ThemeType;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);
// --- End Theme Context ---
