import { colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

export const useThemeColors = () => {
 const {currentTheme} = useTheme();
 return colors[currentTheme];
};