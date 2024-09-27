import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import { AccountContext } from './context/AccountContext';

const Routers = () => {

    const {isLoggedIn} = useContext(AccountContext);

    const location = useLocation();
    const navigate = useNavigate();

    // Helper function to check if the token is expired
    // const isTokenExpired = (token) => {
    //     try {
    //         const decoded = jwtDecode(token);
    //         const currentTime = Date.now() / 1000; // Get current time in seconds
    //         return decoded.exp < currentTime; // Check if the token is expired
    //     } catch (error) {
    //         return true; // If token is invalid or decoding fails, treat it as expired
    //     }
    // };

    // Check if the user is logged in by verifying the token in local storage
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         if (isTokenExpired(token)) {
    //             localStorage.removeItem('token'); // Remove expired token
    //             setIsLoggedIn(false); // Set user as logged out
    //         } else {
    //             setIsLoggedIn(true); // Token is valid, user is logged in
    //         }
    //     } else {
    //         setIsLoggedIn(false); // No token, user is logged out
    //     }
    // }, [location]);

    // Redirect based on login status
    useEffect(() => {
        if (isLoggedIn && (location.pathname === '/login' || location.pathname === '/register')) {
            navigate('/'); // Redirect to home if logged in and accessing login/register
        } else if (!isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register') {
            navigate('/login'); // Redirect to login if not logged in and accessing protected routes
        }
    }, [isLoggedIn, location, navigate]);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/status" element={<Home />} />
            <Route path="/calls" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
};

export default Routers;
