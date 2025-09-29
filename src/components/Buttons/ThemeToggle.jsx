import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LuSun, LuMoon } from 'react-icons/lu';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <LuSun className="w-5 h-5 text-yellow-500" />
            ) : (
                <LuMoon className="w-5 h-5 text-gray-600" />
            )}
        </button>
    );
};

export default ThemeToggle;

