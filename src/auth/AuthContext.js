import React, { createContext, useContext, useEffect, useState } from 'react';
import { saveSession, getToken, getEmail, clearToken } from './session';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true); // true while the saved session is being restored

  useEffect(() => {
    (async () => {
      try {
        setToken(await getToken());
        setEmail(await getEmail());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Real sign-in: the backend checks the credentials and returns a signed token.
  async function signIn(rawEmail, password) {
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@')) throw new Error('Enter a valid email address');
    if (!password) throw new Error('Enter your password');
    let res;
    try {
      res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
    } catch {
      throw new Error('Cannot reach the server. Check your connection and the API address.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.token) throw new Error(data.error || 'Sign-in failed');
    await saveSession(data.token, cleanEmail);
    setEmail(cleanEmail);
    setToken(data.token);
  }

  // Sign-out removes the stored token, then the navigator switches back to the sign-in screen.
  async function signOut() {
    await clearToken();
    setToken(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ token, email, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
