import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeProvider';
import './SetupPage.css';

interface SetupFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

const SetupPage: React.FC = () => {
  const [formData, setFormData] = useState<SetupFormData>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = (): boolean => {
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (!formData.password || formData.password.length < 10) {
      setError('Password must be at least 10 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          confirm_password: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate('/login');
      } else {
        setError(data.error || 'Setup failed. Please try again.');
      }
    } catch (err) {
      console.error('Setup error:', err);
      setError('Setup failed. Could not connect to server or invalid response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.classList.add('loaded');
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <img 
            src="/static/logo/64.png" 
            alt="Huntarr Logo" 
            className="setup-logo" 
            onLoad={handleImageLoad}
          />
          <h1>Huntarr Setup</h1>
        </div>
        
        <div className="setup-form">
          <h2>Create Admin Account</h2>
          <p className="setup-description">
            Welcome to Huntarr! Let's set up your admin account to get started.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i>
                <span>Username</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoFocus
                required
                disabled={isLoading}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <small className="password-hint">Must be at least 10 characters</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i>
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="setup-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i> Create Account
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

export default SetupPage;
