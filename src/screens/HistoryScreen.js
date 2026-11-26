import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { listConversations, deleteConversation } from '../db/database';

export default function HistoryScreen({ navigation }) {
  const { email } = useAuth();
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    listConversations(email).then(setItems).catch(() => setItems([]));
  }, [email]);

  // Reload every time the screen is shown, so new / deleted conversations are reflected.
  useFocusEffect(load);

  function onDelete(item) {
    Alert.alert('Delete conversation', `Delete "${item.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteConversation(item.id);
          load(); // refresh the list after deleting
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(c) => c.id}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.open}
              onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`Open conversation: ${item.title}`}
            >
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.date}>{new Date(item.updated_at).toLocaleString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(item)}
              accessibilityRole="button"
              accessibilityLabel={`Delete conversation: ${item.title}`}
            >
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  open: { flex: 1, minHeight: 56, justifyContent: 'center', paddingVertical: 8 },
  title: { fontSize: 16, color: '#111827' },
  date: { fontSize: 13, color: '#4b5563', marginTop: 2 },
  deleteBtn: { minWidth: 64, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  delete: { fontSize: 16, color: '#b91c1c', fontWeight: '600' },
  empty: { padding: 20, textAlign: 'center', color: '#4b5563', fontSize: 16 },
});
