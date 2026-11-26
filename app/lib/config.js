// Android emulator -> 10.0.2.2 ; iOS simulator -> localhost ; real phone -> your computer's LAN IP
// Put the value in app.json "extra" or an EXPO_PUBLIC_ variable. NEVER put an Anthropic key here.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
