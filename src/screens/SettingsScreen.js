import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { clearAll } from '../db/database';

export default function SettingsScreen({ navigation }) {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.label}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={clearAll}>
        <Text style={styles.label}>Clear conversation history</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={signOut}>
        <Text style={styles.label}>Sign out</Text>
      </TouchableOpacity>
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eeeeee' },
  label: { fontSize: 16 },
  version: { marginTop: 24, color: '#777777' },
});
