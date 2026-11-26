// Task 3(a): token kept in the device's secure storage (Keychain / Keystore), not AsyncStorage.
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

const KEY = 'meridian_token';
const USER_KEY = 'meridian_user';

export async function signIn(email, password) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) throw new Error(data.error || 'Sign-in failed.');
  await SecureStore.setItemAsync(KEY, data.token);
  await SecureStore.setItemAsync(USER_KEY, email.toLowerCase());
  return data.token;
}

export const getToken = () => SecureStore.getItemAsync(KEY);
export const getUserId = () => SecureStore.getItemAsync(USER_KEY);

// Sign-out must remove the token AND the screens must react (navigate to Login).
export async function signOut() {
  await SecureStore.deleteItemAsync(KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
