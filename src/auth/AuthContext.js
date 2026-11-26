import React, { createContext, useContext, useEffect, useState } from 'react';
import { saveToken, getToken, clearToken } from './session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    getToken().then((t) => setToken(t));
  }, []);

  // Demo sign-in: any @meridian.com address with a password is accepted.
  async function signIn(email, password) {
    if (!email.includes('@')) {
      throw new Error('Enter a valid email address');
    }
    const newToken = 'demo-' + Date.now();
    await saveToken(newToken);
    setToken(newToken);
  }

  async function signOut() {
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
