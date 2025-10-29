import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // 1. Initialize state from local storage or default to 'light'
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    );

    // 2. Effect to update local storage and apply 'dark' class to the root HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove existing theme class
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');

        // Add current theme class (Tailwind will read this)
        root.classList.add(theme);
        
        // Save to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};