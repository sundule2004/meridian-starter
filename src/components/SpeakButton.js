import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

// Reads a reply aloud (text-to-speech). Tap again to stop.
export default function SpeakButton({ text }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => { Speech.stop(); }, []); // stop when the message leaves the screen

  const onPress = async () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    // Bug fixed: speak() takes the text as its FIRST argument, not an object.
    Speech.speak(text, {
      language: 'en-GB',
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={speaking ? 'Stop reading aloud' : 'Read this reply aloud'}
    >
      <Text style={styles.label}>{speaking ? 'Stop' : 'Listen'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  label: { fontSize: 15, color: '#1a56db', fontWeight: '600' },
});
