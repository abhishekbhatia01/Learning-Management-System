import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authInitialized } = useAuthStore();

  // Wait for the token refresh attempt to complete before deciding
  if (!authInitialized) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
