import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext — global authentication state.
 *
 * Stores the logged-in user's info and JWT token.
 * Any component can call useAuth() to access or update auth state.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so the user stays logged in on page refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gymUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('gymToken') || null;
  });

  /** Called after successful login/register */
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('gymUser', JSON.stringify(userData));
    localStorage.setItem('gymToken', jwtToken);
  };

  /** Called on logout */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gymUser');
    localStorage.removeItem('gymToken');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Custom hook — use this in any component to access auth state */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
