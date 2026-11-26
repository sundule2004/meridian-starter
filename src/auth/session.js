import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sessionToken';

export async function saveToken(token) {
  await AsyncStorage.setItem(KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(KEY);
}

export async function clearToken() {
  // TODO: remove the stored token
}
