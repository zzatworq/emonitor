import { useEffect } from "react";
import { useTheme } from "@/store/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize theme on mount
    useTheme.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
