import React from 'react';
import { View, Text } from 'react-native';

export default function TypingIndicator() {
  return (
    <View style={{ padding: 8 }}>
      <Text style={{ fontSize: 14, color: '#555555' }}>Assistant is typing...</Text>
    </View>
  );
}
