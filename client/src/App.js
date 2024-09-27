import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeContext, themes } from './context/ThemeContext';
import Routers from './Routers';
import AccountProvider from './context/AccountContext';
import NewChatContextProvider from './context/NewChatContext';
import ConversationProvider from './context/ConversationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { OpenProvider } from './context/OpenContext';

const App = () => {
    // State to track the current theme
    const [theme, setTheme] = useState(localStorage.getItem('theme') || themes.light);

    // Set background color based on the current theme
    useEffect(() => {
        document.body.style.backgroundColor = theme === 'light' ? '#ffffff' : '#18171D';
        localStorage.setItem('theme', theme); // Save the current theme in localStorage
    }, [theme]);

    // Function to toggle between light and dark themes
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? themes.dark : themes.light;
        setTheme(newTheme);
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <AccountProvider>
                <ThemeContext.Provider value={{ theme, toggleTheme }}>
                    <OpenProvider>
                        <NewChatContextProvider>
                            <ConversationProvider>
                                <Router>
                                    <Routers />
                                </Router>
                            </ConversationProvider>
                        </NewChatContextProvider>
                    </OpenProvider>
                </ThemeContext.Provider>
            </AccountProvider>
        </GoogleOAuthProvider>
    );
};

export default App;
