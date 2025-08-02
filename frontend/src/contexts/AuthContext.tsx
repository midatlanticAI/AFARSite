// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

type User = { id: string; role: string } | null;

const AuthCtx = createContext<{ user: User; login: (t: string) => void; logout: () => void }>({ user: null, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    setUser({ id: decoded.sub, role: decoded.role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({ id: decoded.sub, role: decoded.role });
      } catch {
        logout();
      }
    }
  }, []);

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx); 