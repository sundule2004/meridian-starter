import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import * as Speech from 'expo-speech';

// Reads a reply aloud. Not used anywhere yet.
export default function SpeakButton({ text }) {
  const onPress = () => {
    Speech.speak({ text });
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Text>Speak</Text>
    </TouchableOpacity>
  );
}
