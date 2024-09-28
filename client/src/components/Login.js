import React, { useState, useEffect } from 'react';
import styles from '../styles/Register.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Check token expiration and remove if expired
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const decodedToken = jwtDecode(user);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('user');
        setIsVerified(false);
      } else {
        setIsVerified(decodedToken.isVerified);
      }
    }
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: tokenResponse => console.log(tokenResponse),
  });

  const handleChange = (e) => {
    if (e.target.name === 'email') {
      setEmail(e.target.value);
    }
    if (e.target.name === 'otp') {
      setOtp(e.target.value);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log('handleLogIn')

    if (verifying) {
      // Verify OTP step
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/login`, {
          email: email,
          otp: otp,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(response);

          localStorage.setItem('token', response.data.token);
          const decoded = jwtDecode(response.data.user);
          if (decoded.isVerified) {
            setVerifying(false);
            localStorage.setItem('user', response.data.user);
            setTimeout(() => {
              window.location.href = '/'; // Or any protected route
            }, 2000);
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
      }
    } else {
      // Send OTP step
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/login-email`, {
          email: email,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
          setVerifying(true); // Set verifying to true after sending OTP
      
      } catch (error) {
        console.error('Error sending OTP:', error);
      }
    }
  };

  return (
    <div className={`${styles.registerForm} container mt-5`}>
      <div className={`${styles.image}`}>
        <img src="/formImage.jpg" alt="formImage" />
      </div>
      <div className={`${styles.form}`}>
        <form onSubmit={handleLogin}>
          <h2>Login to your account</h2>
          <p>
            Don't have an account? <Link to={'/register'}>Register</Link>
          </p>

          {!isVerified && (
            <>
              <div className={`${styles.input}`}>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </div>
              {verifying && (
                <div className={`${styles.input}`}>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={handleChange}
                    placeholder="OTP"
                    required
                  />
                </div>
              )}
              <div className={`${styles.btn}`}>
                <button type="submit">{verifying ? 'Verify Otp and Login' : 'Send Otp'}</button>
              </div>
              {/* <GoogleLogin
                onSuccess={credentialResponse => {
                  console.log(credentialResponse);
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
              />; */}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
