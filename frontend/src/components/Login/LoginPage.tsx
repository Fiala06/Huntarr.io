import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeProvider';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    // Check if setup is required
    const checkSetupRequired = async () => {
      try {
        const response = await fetch('/api/system/status');
        const data = await response.json();
        
        if (data.requires_setup) {
          navigate('/setup');
        }
      } catch (err) {
        console.error('Error checking system status:', err);
      }
    };
    
    checkSetupRequired();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Build the request body
    const requestBody: Record<string, string> = {
      username,
      password
    };

    // Add OTP code if 2FA is showing and a code was provided
    if (showTwoFactor && otpCode) {
      requestBody.otp_code = otpCode;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        navigate(data.redirect || '/');
      } else if (data.requires_2fa) {
        setShowTwoFactor(true);
        
        if (requestBody.otp_code) {
          setError(data.error || 'Invalid 2FA code');
          setOtpCode('');
        } else {
          setError('Please enter your 6-digit 2FA code.');
        }
      } else {
        setShowTwoFactor(false);
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Could not connect to server or invalid response.');
      setShowTwoFactor(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user types
    if (error) setError('');
    
    const { id, value } = e.target;
    if (id === 'username') setUsername(value);
    else if (id === 'password') setPassword(value);
    else if (id === 'twoFactorCode') setOtpCode(value.replace(/[^0-9]/g, '').substring(0, 6));
  };

  // Auto-focus on the OTP field when it appears
  useEffect(() => {
    if (showTwoFactor) {
      const otpInput = document.getElementById('twoFactorCode');
      if (otpInput) otpInput.focus();
    }
  }, [showTwoFactor]);

  // Function to handle image loading animation
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.classList.add('loaded');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img 
            src="/static/logo/64.png" 
            alt="Huntarr Logo" 
            className="login-logo" 
            onLoad={handleImageLoad}
          />
          <h1>Huntarr</h1>
        </div>
        <div className="login-form">
          <h2>Log in to your account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i>
                <span>Username</span>
              </label>
              <input 
                type="text" 
                id="username" 
                value={username}
                onChange={handleInputChange}
                required 
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                <span>Password</span>
              </label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={handleInputChange}
                required 
                disabled={isLoading}
              />
            </div>
            {showTwoFactor && (
              <div className="form-group two-factor-group" id="twoFactorGroup">
                <label htmlFor="twoFactorCode">
                  <i className="fas fa-shield-alt"></i>
                  <span>Two-Factor Code</span>
                </label>
                <input 
                  type="text" 
                  id="twoFactorCode" 
                  placeholder="000000" 
                  maxLength={6}
                  value={otpCode}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Log In
                </>
              )}
            </button>
          </form>
          <div className="theme-toggle">
            <span>Dark Mode</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
