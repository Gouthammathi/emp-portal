import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ABAPTest from './Tests/ABAPTest';
import BTPTest from './Tests/BTPTest';
import TMTest from './Tests/TMTest';
import EWMTest from './Tests/EWMTest';

const Test = () => {
  const { moduleId } = useParams();

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