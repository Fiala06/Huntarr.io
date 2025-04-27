import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TwoFactorData {
  qr_code_url: string;
  secret: string;
}

const SetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null);
  const [error, setError] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if setup is needed
    fetch('/api/setup-status')
      .then(response => response.json())
      .then(data => {
        if (!data.needs_setup) {
          navigate('/login');
        }
      })
      .catch(error => {
        console.error('Error checking setup status:', error);
      });
  }, [navigate]);

  const validatePassword = (pwd: string): boolean => {
    return pwd.length >= 10;
  };

  const handleAccountSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 10 characters long');
      return;
    }

    try {
      const response = await fetch('/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          confirm_password: confirmPassword
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setAccountCreated(true);
        
        // Generate 2FA setup
        const twoFAResponse = await fetch('/api/user/2fa/setup', { method: 'POST' });
        
        if (!twoFAResponse.ok) {
          if (twoFAResponse.status === 401) {
            throw new Error('Unauthorized - Session likely not established yet.');
          }
          const errorData = await twoFAResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${twoFAResponse.status}`);
        }
        
        const twoFactorData = await twoFAResponse.json();
        
        if (twoFactorData.success) {
          setTwoFactorData(twoFactorData);
          setCurrentStep(2);
        } else {
          throw new Error(twoFactorData.error || 'Failed to set up two-factor authentication');
        }
      } else {
        throw new Error(data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error during account setup:', error);
      setError((error as Error).message || 'An error occurred during account setup');
    }
  };

  const handleTwoFactorVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: verificationCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTwoFactorEnabled(true);
        setCurrentStep(3);
      } else {
        throw new Error(data.message || 'Failed to verify two-factor authentication');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setError((error as Error).message || 'Invalid verification code');
    }
  };

  const handleSkip2FA = () => {
    setCurrentStep(3);
  };

  const handleFinishSetup = () => {
    navigate('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="setup-screen active">
            <h3>Create Admin Account</h3>
            <form onSubmit={handleAccountSetup}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="password-requirements">
                Password must be at least 10 characters.
              </div>
              <button type="submit" className="setup-button" id="accountNextButton">
                Create Account
              </button>
            </form>
          </div>
        );
        
      case 2:
        return (
          <div className="setup-screen active">
            <h3>Two-Factor Authentication</h3>
            <p>Scan this QR code with your authenticator app:</p>
            <div className="qr-code-container" id="qrCode">
              {twoFactorData?.qr_code_url && (
                <div className="qr-code">
                  <img src={twoFactorData.qr_code_url} alt="QR Code" />
                </div>
              )}
            </div>
            <p>Or enter this key manually:</p>
            <div className="secret-key" id="secretKey">
              {twoFactorData?.secret || ''}
            </div>
            <form onSubmit={handleTwoFactorVerification}>
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="setup-button" id="twoFactorNextButton">
                Verify Code
              </button>
            </form>
            <div className="skip-2fa">
              <a href="#" id="skip2FALink" onClick={handleSkip2FA}>
                Skip two-factor setup for now
              </a>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="setup-screen active">
            <h3>Setup Complete!</h3>
            <div className="setup-success">
              <i className="fas fa-check-circle"></i>
              <p>Your Huntarr instance is ready to use.</p>
              <p>Two-Factor Authentication: {twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <button className="setup-button" id="finishSetupButton" onClick={handleFinishSetup}>
              Go to Dashboard
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="login-page">
      <div className="login-container setup-container">
        <div className="login-header">
          <img src="/static/logo/64.png" alt="Huntarr Logo" className="login-logo" />
          <h2>Huntarr Setup</h2>
        </div>
        
        <div className="setup-steps">
          <div className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            Account
          </div>
          <div className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            Two-Factor
          </div>
          <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
            Complete
          </div>
        </div>
        
        <div className="login-body">
          {error && <div className="error-message" id="errorMessage">{error}</div>}
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
