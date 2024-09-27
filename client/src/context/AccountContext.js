import React, { createContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

// Create AccountContext
export const AccountContext = createContext();

const AccountProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [person, setPerson] = useState({});
    const [chatPerson, setChatPerson] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);

    const socket = useRef();

    useEffect(() => {
        socket.current = io('ws://localhost:9000');

        socket.current?.on('connect', () => {
            console.log('Connected to server');
        });

        socket.current?.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            socket.current.disconnect();
        }
    }, [])


    // Helper function to check if the token is expired
    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Get current time in seconds
            return decoded.exp < currentTime; // Check if the token is expired
        } catch (error) {
            return true; // If token is invalid or decoding fails, treat it as expired
        }
    };

    // Function to fetch user details from the token
    const fetchUserDetails = () => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    _id: decoded._id,        // Assuming the token contains user ID
                    name: decoded.name,  // Assuming the token contains a username
                    email: decoded.email,  // Assuming the token contains an email
                    picture: decoded.picture, // Assuming the token contains a profile picture
                    mobileNumber: decoded.mobileNumber, // Assuming the token contains a mobile number
                });
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error decoding token:', error);
                setUser(null);
                setIsLoggedIn(false);
            }
        } else {
            localStorage.removeItem('token'); // Remove invalid/expired token
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    // Automatically fetch user details when component mounts
    useEffect(() => {
        fetchUserDetails();
    }, []);

    console.log(person)

    // Function to logout (remove token and user data)
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AccountContext.Provider value={{
            user,
            isLoggedIn,
            fetchUserDetails,
            logout,
            person,
            setPerson,
            chatPerson,
            setChatPerson,
            socket,
            activeUsers,
            setActiveUsers
        }}>
            {children}
        </AccountContext.Provider>
    );
};

export default AccountProvider;
