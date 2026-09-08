import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ThemeType = "light" | "dark";

type State = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
};

export const useTheme = create<State>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme: ThemeType) => {
        set({ theme });
        // Apply theme to DOM
        if (typeof document !== "undefined") {
          const html = document.documentElement;
          if (theme === "light") {
            html.setAttribute("data-theme", "light");
          } else {
            html.removeAttribute("data-theme");
          }
        }
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },
    }),
    {
      name: "theme-preference",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => {
        return (state) => {
          if (state && typeof document !== "undefined") {
            const html = document.documentElement;
            if (state.theme === "light") {
              html.setAttribute("data-theme", "light");
            } else {
              html.removeAttribute("data-theme");
            }
          }
        };
      },
    },
  ),
);
