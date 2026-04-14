import { onMounted, ref } from "vue";

const THEME_STORAGE_KEY = "laser-theme";

export function useTheme() {
  const theme = ref("light");

  function applyTheme(nextTheme) {
    theme.value = nextTheme;
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  function toggleTheme() {
    applyTheme(theme.value === "dark" ? "light" : "dark");
  }

  onMounted(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(savedTheme || (prefersDark ? "dark" : "light"));
  });

  return {
    theme,
    applyTheme,
    toggleTheme,
  };
}
