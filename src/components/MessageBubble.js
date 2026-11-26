import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <View style={styles.bubble}>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: '#eeeeee',
    borderRadius: 10,
    padding: 8,
    margin: 4,
    maxWidth: '80%',
  },
  text: { fontSize: 11, color: '#aaaaaa' },
});
