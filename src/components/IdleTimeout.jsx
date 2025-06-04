import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

const IdleTimeout = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    let idleTimer = null;

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(handleLogout, IDLE_TIMEOUT);
    };

    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    // Events to track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup function
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate, auth]);

  return null; // This component doesn't render anything
};

export default IdleTimeout; 