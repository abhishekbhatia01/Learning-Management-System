import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { user, authInitialized } = useAuthStore();

  // Wait for the token refresh attempt to complete before deciding
  if (!authInitialized) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default RoleBasedRoute;
