import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { clearAll } from '../db/database';

export default function SettingsScreen() {
  const { signOut, email } = useAuth();

  function onClear() {
    Alert.alert('Clear history', 'Delete ALL your saved conversations from this device? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
        onPress: async () => {
          await clearAll(email);
          Alert.alert('Done', 'Your conversation history was deleted.');
        },
      },
    ]);
  }

  // (the old "Back" row navigated to 'SignIn', a screen that does not exist while signed in;
  //  the header already has a working back button)
  return (
    <View style={styles.container}>
      <Text style={styles.signedIn}>Signed in as {email}</Text>
      <TouchableOpacity style={styles.row} onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear conversation history">
        <Text style={styles.label}>Clear conversation history</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={signOut} accessibilityRole="button" accessibilityLabel="Sign out">
        <Text style={styles.label}>Sign out</Text>
      </TouchableOpacity>
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  signedIn: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  row: { minHeight: 52, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  label: { fontSize: 16, color: '#111827' },
  version: { marginTop: 24, color: '#4b5563', fontSize: 14 },
});
