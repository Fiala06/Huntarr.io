import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SystemStatusChecker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Don't interfere with setup and login paths
    if (location.pathname === '/setup' || location.pathname === '/login') {
      return;
    }

    // Check if setup is required
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/system/status');
        const data = await response.json();
        
        if (data.requires_setup) {
          navigate('/setup');
        } else if (isAuthenticated === false && location.pathname !== '/login') {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error checking system status:', err);
      }
    };
    
    checkSetupStatus();
  }, [isAuthenticated, navigate, location.pathname]);
  
  // This component doesn't render anything
  return null;
};

export default SystemStatusChecker;
