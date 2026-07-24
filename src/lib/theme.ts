import { useState } from "react";

type Theme = "light";

export function useTheme() {
  const [theme] = useState<Theme>("light");
  const toggle = () => {};
  const setTheme = (_: Theme) => {};
  return { theme, toggle, setTheme };
}
