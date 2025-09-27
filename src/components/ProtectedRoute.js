// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token exists, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If a token exists, render the child component (e.g., the Profile page)
  return children;
};

export default ProtectedRoute;