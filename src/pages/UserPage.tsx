import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserPage: React.FC = () => {
  const [user, setUser] = useState<{username: string, is_2fa_enabled: boolean} | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const { logout } = useAuth();
  const navigate = useNavigate();

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
          logout();
          navigate('/login');
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
          logout();
          navigate('/login');
        }, 3000);
      } else {
        setPasswordStatus({ message: data.error || 'Failed to update password', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordStatus({ message: 'An error occurred while updating password', type: 'error' });
    }
  };

  if (loading) {
    return <div className="content-section active">Loading user data...</div>;
  }

  if (error) {
    return <div className="content-section active">Error loading user data: {error}</div>;
  }

  return (
    <div className="content-section active" id="userSection">
      <div className="user-section">
        <div className="user-card">
          <h3><i className="fas fa-user"></i> Account Information</h3>
          <p><strong>Username:</strong> <span id="currentUsername">{user?.username || 'Unknown'}</span></p>
          <p><strong>Two-Factor Authentication:</strong> <span id="twoFactorEnabled">{user?.is_2fa_enabled ? 'Enabled' : 'Disabled'}</span></p>
        </div>
        
        <div className="user-card">
          <h3><i className="fas fa-user-edit"></i> Change Username</h3>
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
          <button className="button-primary" onClick={handleUsernameChange}>Change Username</button>
          {usernameStatus && (
            <div className={`status-${usernameStatus.type}`}>{usernameStatus.message}</div>
          )}
        </div>
        
        <div className="user-card">
          <h3><i className="fas fa-key"></i> Change Password</h3>
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
          <button className="button-primary" onClick={handlePasswordChange}>Change Password</button>
          {passwordStatus && (
            <div className={`status-${passwordStatus.type}`}>{passwordStatus.message}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;