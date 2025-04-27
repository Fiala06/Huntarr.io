import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../Layout/MainLayout';
import { User } from '../../types';
import './UserProfilePage.css';

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [newUsername, setNewUsername] = useState<string>('');
  const [currentPasswordForUsername, setCurrentPasswordForUsername] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<{ message: string, type: string } | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordStatus, setPasswordStatus] = useState<{ message: string, type: string } | null>(null);
  
  const [twoFactorQrCode, setTwoFactorQrCode] = useState<string>('');
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>('');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [twoFactorStatus, setTwoFactorStatus] = useState<{ message: string, type: string } | null>(null);
  
  const [currentPasswordFor2FADisable, setCurrentPasswordFor2FADisable] = useState<string>('');
  const [otpCodeFor2FADisable, setOtpCodeFor2FADisable] = useState<string>('');
  const [disableStatus, setDisableStatus] = useState<{ message: string, type: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/info');
        if (!response.ok) {
          throw new Error(`Failed to load user data: ${response.status}`);
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 10) {
      return 'Password must be at least 10 characters long.';
    }
    return null;
  };

  const handleUsernameChange = async () => {
    if (!newUsername || !currentPasswordForUsername) {
      setUsernameStatus({ message: 'Both username and password are required', type: 'error' });
      return;
    }
    
    if (newUsername.trim().length < 3) {
      setUsernameStatus({ message: 'Username must be at least 3 characters long', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/user/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: currentPasswordForUsername
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsernameStatus({ message: 'Username updated successfully. You will be logged out shortly.', type: 'success' });
        setNewUsername('');
        setCurrentPasswordForUsername('');
        
        // Update displayed username
        if (user) {
          setUser({ ...user, username: newUsername });
        }
        
        // Wait and logout
        setTimeout(() => {
          handleLogout();
        }, 3000);
      } else {
        setUsernameStatus({ message: data.error || 'Failed to update username', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameStatus({ message: 'An error occurred while updating username', type: 'error' });
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ message: 'All fields are required', type: 'error' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPasswordStatus({ message: passwordError, type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPasswordStatus({ message: 'Password updated successfully. You will be logged out shortly.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Wait and logout
        setTimeout(() => {
          handleLogout();
        }, 3000);
      } else {
        setPasswordStatus({ message: data.error || 'Failed to update password', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordStatus({ message: 'An error occurred while updating password', type: 'error' });
    }
  };

  const setup2FA = async () => {
    try {
      const response = await fetch('/api/user/2fa/setup', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setTwoFactorQrCode(data.qr_code_url);
        setTwoFactorSecret(data.secret);
        
        // Show setup section
        const setupSection = document.getElementById('setupTwoFactorSection');
        if (setupSection) {
          setupSection.style.display = 'block';
        }
        
        setTwoFactorStatus({ message: 'Scan the QR code or enter the secret in your authenticator app', type: 'info' });
      } else {
        setTwoFactorStatus({ message: data.error || 'Failed to set up 2FA', type: 'error' });
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      setTwoFactorStatus({ message: 'An error occurred during 2FA setup', type: 'error' });
    }
  };

  const verify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6 || !/^\d{6}$/.test(twoFactorCode)) {
      setTwoFactorStatus({ message: 'Please enter a valid 6-digit code', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTwoFactorStatus({ message: '2FA enabled successfully', type: 'success' });
        setTwoFactorCode('');
        
        // Update user 2FA status
        if (user) {
          setUser({ ...user, is_2fa_enabled: true });
        }
        
        // Hide setup section
        const setupSection = document.getElementById('setupTwoFactorSection');
        if (setupSection) {
          setupSection.style.display = 'none';
        }
        
        // Show disable section
        const disableSection = document.getElementById('disableTwoFactorSection');
        if (disableSection) {
          disableSection.style.display = 'block';
        }
      } else {
        setTwoFactorStatus({ message: data.message || 'Invalid verification code', type: 'error' });
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      setTwoFactorStatus({ message: 'An error occurred while verifying 2FA', type: 'error' });
    }
  };

  const disable2FA = async () => {
    if (!currentPasswordFor2FADisable) {
      setDisableStatus({ message: 'Password is required', type: 'error' });
      return;
    }
    
    if (!otpCodeFor2FADisable || otpCodeFor2FADisable.length !== 6 || !/^\d{6}$/.test(otpCodeFor2FADisable)) {
      setDisableStatus({ message: 'Please enter a valid 6-digit code', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/user/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: currentPasswordFor2FADisable,
          code: otpCodeFor2FADisable
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDisableStatus({ message: '2FA disabled successfully', type: 'success' });
        setCurrentPasswordFor2FADisable('');
        setOtpCodeFor2FADisable('');
        
        // Update user 2FA status
        if (user) {
          setUser({ ...user, is_2fa_enabled: false });
        }
        
        // Hide disable section
        const disableSection = document.getElementById('disableTwoFactorSection');
        if (disableSection) {
          disableSection.style.display = 'none';
        }
        
        // Show enable section
        const enableSection = document.getElementById('enableTwoFactorSection');
        if (enableSection) {
          enableSection.style.display = 'block';
        }
      } else {
        setDisableStatus({ message: data.error || 'Failed to disable 2FA', type: 'error' });
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setDisableStatus({ message: 'An error occurred while disabling 2FA', type: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate('/login');
      } else {
        console.error('Logout failed:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return <MainLayout title="User Settings"><div className="loading-spinner">Loading user data...</div></MainLayout>;
  }

  if (error) {
    return <MainLayout title="User Settings"><div className="error-message">{error}</div></MainLayout>;
  }

  return (
    <MainLayout title="User Settings">
      <div className="user-profile-container">
        <div className="profile-section">
          <h2>Account Settings</h2>
          
          <div className="user-info-card">
            <h3>Account Information</h3>
            <p><strong>Username:</strong> <span id="currentUsername">{user?.username || 'Unknown'}</span></p>
            <p><strong>Two-Factor Authentication:</strong> <span id="twoFactorEnabled">{user?.is_2fa_enabled ? 'Enabled' : 'Disabled'}</span></p>
          </div>
          
          <div className="user-card">
            <h3>Change Username</h3>
            <div className="form-group">
              <label htmlFor="newUsername">New Username:</label>
              <input 
                type="text" 
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentPasswordForUsernameChange">Current Password:</label>
              <input 
                type="password" 
                id="currentPasswordForUsernameChange" 
                value={currentPasswordForUsername}
                onChange={(e) => setCurrentPasswordForUsername(e.target.value)}
              />
            </div>
            <button className="user-button" onClick={handleUsernameChange}>Change Username</button>
            {usernameStatus && (
              <div className={`status-${usernameStatus.type}`}>{usernameStatus.message}</div>
            )}
          </div>
          
          <div className="user-card">
            <h3>Change Password</h3>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input 
                type="password" 
                id="currentPassword" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input 
                type="password" 
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button className="user-button" onClick={handlePasswordChange}>Change Password</button>
            {passwordStatus && (
              <div className={`status-${passwordStatus.type}`}>{passwordStatus.message}</div>
            )}
          </div>
          
          <div className="user-card">
            <h3>Two-Factor Authentication</h3>
            
            {/* Enable 2FA Section */}
            <div id="enableTwoFactorSection" style={{ display: user?.is_2fa_enabled ? 'none' : 'block' }}>
              <p>Enhance your account security by enabling two-factor authentication.</p>
              <button className="user-button" onClick={setup2FA}>Setup 2FA</button>
            </div>
            
            {/* 2FA Setup Section */}
            <div id="setupTwoFactorSection" style={{ display: 'none' }}>
              <p>Scan this QR code with your authenticator app:</p>
              {twoFactorQrCode && (
                <div className="qr-code">
                  <img src={twoFactorQrCode} alt="2FA QR Code" />
                </div>
              )}
              
              <p>Or enter this code manually in your app:</p>
              <div className="secret-key">{twoFactorSecret}</div>
              
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code:</label>
                <input 
                  type="text" 
                  id="verificationCode" 
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                />
              </div>
              <button className="user-button" onClick={verify2FA}>Verify & Enable</button>
              {twoFactorStatus && (
                <div className={`status-${twoFactorStatus.type}`}>{twoFactorStatus.message}</div>
              )}
            </div>
            
            {/* Disable 2FA Section */}
            <div id="disableTwoFactorSection" style={{ display: user?.is_2fa_enabled ? 'block' : 'none' }}>
              <p>Two-factor authentication is currently enabled. To disable it, please confirm your password and enter your current 2FA code.</p>
              <div className="form-group">
                <label htmlFor="currentPasswordFor2FADisable">Current Password:</label>
                <input 
                  type="password" 
                  id="currentPasswordFor2FADisable"
                  value={currentPasswordFor2FADisable}
                  onChange={(e) => setCurrentPasswordFor2FADisable(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="otpCodeFor2FADisable">Current 2FA Code:</label>
                <input 
                  type="text" 
                  id="otpCodeFor2FADisable" 
                  placeholder="000000"
                  maxLength={6}
                  value={otpCodeFor2FADisable}
                  onChange={(e) => setOtpCodeFor2FADisable(e.target.value)}
                />
              </div>
              <button className="user-button danger-button" onClick={disable2FA}>Disable 2FA</button>
              {disableStatus && (
                <div className={`status-${disableStatus.type}`}>{disableStatus.message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage;
