import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SpeakButton from './SpeakButton';
import TalkToPersonButton from './TalkToPersonButton';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text
          style={[styles.text, isUser ? styles.textUser : styles.textBot]}
          accessibilityLabel={`${isUser ? 'You' : 'Assistant'}: ${message.text}`}
        >
          {message.text}
        </Text>
        {!isUser && <SpeakButton text={message.text} />}
        {!isUser && !!message.handoff && <TalkToPersonButton />}
      </View>
    </View>
  );
}

// User and assistant messages are now told apart (side + colour); text is 16px with strong contrast.
const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 8 },
  rowUser: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },
  bubble: { borderRadius: 12, padding: 12, maxWidth: '85%' },
  bubbleUser: { backgroundColor: '#1a56db' },
  bubbleBot: { backgroundColor: '#f1f3f5', borderWidth: 1, borderColor: '#d1d5db' },
  text: { fontSize: 16, lineHeight: 22, flexShrink: 1 },
  textUser: { color: '#ffffff' },
  textBot: { color: '#111827' },
});
