import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string>();

  const handleLogin = (password: string) => {
    // Store token in sessionStorage for API calls
    sessionStorage.setItem('admin-token', password);
    
    // For security, we don't validate the password on client side
    // The server will validate it on each API request
    setIsAuthenticated(true);
    setLoginError(undefined);
  };

  const handleLogout = () => {
    // Clear the admin token from sessionStorage
    sessionStorage.removeItem('admin-token');
    setIsAuthenticated(false);
    setLoginError(undefined);
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <AdminLogin onLogin={handleLogin} error={loginError} />;
}