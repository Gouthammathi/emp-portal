import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ABAPTest from './Tests/ABAPTest';
import BTPTest from './Tests/BTPTest';
import TMTest from './Tests/TMTest';
import EWMTest from './Tests/EWMTest';
import MobileNotSupported from './MobileNotSupported';

const Test = () => {
  const { moduleId } = useParams();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is typical laptop/desktop breakpoint
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileNotSupported />;
  }

  // Route to the appropriate test component based on moduleId
  switch (moduleId) {
    case 'abap':
      return <ABAPTest />;
    case 'btp':
      return <BTPTest />;
    case 'tm':
      return <TMTest />;
    case 'ewm':
      return <EWMTest />;
    default:
      return <Navigate to="/module-selection" replace />;
  }
};

export default Test; 