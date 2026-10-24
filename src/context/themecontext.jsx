
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'vydora-theme';

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getSavedTheme);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light'
    );
  }, []);

  const changeTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Could not save theme preference:', error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider.');
  }

  return context;
}
