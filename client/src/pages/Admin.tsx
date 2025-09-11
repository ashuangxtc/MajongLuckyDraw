import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string>();

  const handleLogin = (password: string) => {
    // 简单验证 //todo: remove mock functionality
    if (password === "admin123") {
      setIsAuthenticated(true);
      setLoginError(undefined);
    } else {
      setLoginError("密码错误，请重试");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginError(undefined);
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <AdminLogin onLogin={handleLogin} error={loginError} />;
}