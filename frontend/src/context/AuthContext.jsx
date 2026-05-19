import { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gymUser');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed?.token) throw new Error('No token');
        const decoded = jwtDecode(parsed.token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(parsed);
        } else {
          localStorage.removeItem('gymUser');
        }
      } catch {
        localStorage.removeItem('gymUser');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login — calls POST /api/auth/login
   * Backend AuthResponse: { token, tokenType, userId, firstName, lastName, email, role }
   * role is "ROLE_ADMIN" / "ROLE_TRAINER" / "ROLE_MEMBER" (fixed in AuthResponse.java)
   */
  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('gymUser', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gymUser');
    setUser(null);
  }, []);

  // Role helpers
  const isAdmin   = user?.role === 'ROLE_ADMIN';
  const isTrainer = user?.role === 'ROLE_TRAINER';
  const isMember  = user?.role === 'ROLE_MEMBER';

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAdmin, isTrainer, isMember,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
