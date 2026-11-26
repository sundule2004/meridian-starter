import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { listConversations, deleteConversation } from '../db/database';

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listConversations().then(setItems);
  }, []);

  async function onDelete(id) {
    await deleteConversation(id);
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
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
            >
              <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
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
  row: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderColor: '#eeeeee' },
  title: { fontSize: 10, color: '#999999' },
  delete: { fontSize: 10, color: '#ff9999' },
  empty: { padding: 20, textAlign: 'center', color: '#777777' },
});
