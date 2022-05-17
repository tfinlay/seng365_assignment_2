import {useEffect, useState} from "react";

type SystemTheme = "dark" | "light"

/**
 * React hook for the system theme (dark or light mode).
 */
export const useSystemTheme = (): SystemTheme => {
  const [theme, setTheme] = useState<SystemTheme>(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  )

  useEffect(() => {
    if (window.matchMedia) {
      const matcher = window.matchMedia("(prefers-color-scheme: dark)")
      setTheme(matcher.matches ? "dark" : "light")

      const changeListener = (evt: MediaQueryListEventMap["change"]) => {
        setTheme(evt.matches ? "dark" : "light")
      }

      matcher.addEventListener('change', changeListener)
      return () => {
        matcher.removeEventListener("change", changeListener)
      }
    }
  }, [])

  return theme
}