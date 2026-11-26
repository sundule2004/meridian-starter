// Task 7 (option: text-to-speech). Needs: npx expo install expo-speech
import * as Speech from 'expo-speech';

export const speak = (text, onDone) =>
  Speech.speak(text, { language: 'en-GB', rate: 0.95, onDone, onStopped: onDone, onError: onDone });
export const stopSpeaking = () => Speech.stop();
export const isSpeaking = () => Speech.isSpeakingAsync();
