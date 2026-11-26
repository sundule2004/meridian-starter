import React, { useState, useLayoutEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import { askAssistant } from '../api/chat';
import { saveConversation } from '../db/database';

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={{ marginRight: 16 }}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text>Settings</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  async function send() {
    const text = input;
    const userMsg = { id: String(Date.now()), role: 'user', text };
    setMessages([...messages, userMsg]);
    setInput('');

    const reply = await askAssistant(text);

    const botMsg = { id: String(Date.now()), role: 'assistant', text: reply };
    setMessages((prev) => [...prev, botMsg]);
    await saveConversation('c1', text.slice(0, 30), [...messages, userMsg, botMsg]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />
      {loading && <TypingIndicator />}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question"
        />
        <TouchableOpacity style={styles.send} onPress={send}>
          <Text style={{ color: '#fff' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  inputBar: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#dddddd' },
  input: { flex: 1, borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 8, fontSize: 10 },
  send: { backgroundColor: '#1a56db', paddingHorizontal: 14, justifyContent: 'center', marginLeft: 8, borderRadius: 8 },
});
