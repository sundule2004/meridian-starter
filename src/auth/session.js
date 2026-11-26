import * as SecureStore from 'expo-secure-store';

// Token and e-mail live in the device's secure storage (Keychain / Keystore), not AsyncStorage.
const TOKEN_KEY = 'sessionToken';
const EMAIL_KEY = 'sessionEmail';

export async function saveSession(token, email) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(EMAIL_KEY, email);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getEmail() {
  return SecureStore.getItemAsync(EMAIL_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(EMAIL_KEY);
}
