import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import styles from '../styles/Sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';
import { AccountContext } from '../context/AccountContext';
import { useOpenContext } from '../context/OpenContext';

const Sidebar = () => {
    const { isChatOpen, handleOpenChat, handleOpenConversation, isConversationOpen } = useOpenContext();

    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext); // Use theme and toggleTheme from context
    const [open, setOpen] = useState(false);

    const { user, setChatPerson } = useContext(AccountContext);

    const toggleOpenHam = () => {
        setOpen(!open);
    };

    // Calculate the position of the active bar based on the route
    const calculateActiveBarPosition = () => {
        switch (location.pathname) {
            case '/':
                return '0'; // Default position
            case '/status':
                return '50px'; // Example: shift by 50px for 'status' page
            case '/calls':
                return '100px'; // Example: shift by 100px for 'calls' page
            default:
                return '0'; // Default case, fallback
        }
    };

    return (
        <div className={`${styles.sidebar} ${theme === 'light' ? styles.sidebarLight : styles.sidebarDark} ${open ? styles.sidebarOpen : styles.sidebarClose} text-${theme === 'light' ? 'black' : 'white'}`}>
            <div className={styles.top}>
                <div className={`${styles.hamburger} ${theme === 'light' ? styles.hamburgerLight : styles.hamburgerDark} ${open ? styles.hamOpen : styles.hamClose}`} onClick={toggleOpenHam}>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                </div>
                <div className={styles.profile}>
                    <img src={user ? user.picture : ''} alt="profile" />
                    <i className="fa-solid fa-plus"></i>
                </div>
                <div className={styles.menu}>
                    <ul>
                        <Link to={'/'}><img src="/chat.png" alt="" className={`${location.pathname === '/' && styles.activeLink}`} onClick={(e)=>{
                            handleOpenConversation();
                            setChatPerson('')
                        }} /></Link>
                        <Link to={'/status'}><img src="/status.png" alt="" className={`${location.pathname === '/status' && styles.activeLink}`} /></Link>
                        <Link to={'/calls'}><img src="/telephone.png" alt="" className={`${location.pathname === '/calls' && styles.activeLink}`} /></Link>
                        <div className={styles.activeBar} style={{ transform: `translateY(${calculateActiveBarPosition()})` }}></div>
                    </ul>
                </div>
            </div>
            <div className={styles.themeButton}>
                {/* Button for light theme */}
                <div className={`${theme === 'light' ? styles.activeTheme : ''}`} onClick={toggleTheme}>
                    <img src="/sun.png" alt="Light Mode" />
                </div>
                {/* Button for dark theme */}
                <div className={`${theme === 'dark' ? styles.activeTheme : ''}`} onClick={toggleTheme}>
                    <img src="/moon.png" alt="Dark Mode" />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
