import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const applyTheme = (dark: boolean) => {
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      applyTheme(saved === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark)
    }
  }

  const toggleTheme = () => {
    applyTheme(!isDark.value)
  }

  return { isDark, initTheme, toggleTheme }
}