import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const ThemeToggle = () => {
  const { darkMode, setDarkMode } = useAdmin();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 border-2 border-primary/20 hover:border-primary transition-all duration-300 text-text-bright flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {darkMode ? (
        <Sun size={20} className="text-primary" />
      ) : (
        <Moon size={20} className="text-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;
