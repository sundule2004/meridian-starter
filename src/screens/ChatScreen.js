import React, { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import TalkToPersonButton from '../components/TalkToPersonButton';
import { askAssistant } from '../api/chat';
import { useAuth } from '../auth/AuthContext';
import {
  createConversation, addMessage, getMessages, conversationExists, newId,
} from '../db/database';

export default function ChatScreen({ navigation, route }) {
  const { email, signOut } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { message, handoff }
  const convRef = useRef(null);             // id of the conversation being shown (null = new chat)
  const listRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.setParams({ conversationId: null, nonce: Date.now() })}
            accessibilityRole="button" accessibilityLabel="Start a new chat">
            <Text style={styles.headerTxt}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('History')}
            accessibilityRole="button" accessibilityLabel="Open conversation history">
            <Text style={styles.headerTxt}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button" accessibilityLabel="Open settings">
            <Text style={styles.headerTxt}>Settings</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // Open a past conversation (conversationId from History) or start fresh.
  // Before: the id was ignored, so past conversations could never be reopened.
  useEffect(() => {
    const id = route.params?.conversationId ?? null;
    setError(null);
    if (!id) { convRef.current = null; setMessages([]); return; }
    getMessages(id).then((rows) => { convRef.current = id; setMessages(rows); });
  }, [route.params?.conversationId, route.params?.nonce]);

  // If the open conversation was deleted (History / Clear history), reset instead of failing on save.
  useFocusEffect(useCallback(() => {
    const id = convRef.current;
    if (id) {
      conversationExists(id).then((ok) => { if (!ok) { convRef.current = null; setMessages([]); } });
    }
  }, []));

  // Ask the assistant for a reply to this history, save it, and show it.
  async function ask(history) {
    setLoading(true);
    setError(null);
    try {
      const { reply, handoff } = await askAssistant(history);
      const botMsg = { id: newId(), role: 'assistant', text: reply, handoff: handoff ? 1 : 0 };
      await addMessage(convRef.current, botMsg);
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      if (e.auth) { await signOut(); return; }
      setError({ message: e.message || 'Something went wrong.', handoff: !!e.handoff });
    } finally {
      setLoading(false); // before: loading was never set, so no loading state ever showed
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return; // before: empty messages and double-taps were sent
    setInput('');
    try {
      if (!convRef.current) {
        const id = newId();
        await createConversation(id, email, text.slice(0, 40)); // before: every chat overwrote id 'c1'
        convRef.current = id;
      }
      const userMsg = { id: newId(), role: 'user', text, handoff: 0 };
      await addMessage(convRef.current, userMsg);
      const history = [...messages, userMsg];
      setMessages(history);
      await ask(history);
    } catch (e) {
      setError({ message: 'Could not save this message on your device.', handoff: false });
    }
  }

  const last = messages[messages.length - 1];
  const canRetry = !loading && error && last && last.role === 'user';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text style={styles.empty}>Ask about leave, expenses, remote working, passwords or IT support.</Text>
        }
      />
      {loading && <TypingIndicator />}
      {error && (
        <View style={styles.errorBox} accessibilityLiveRegion="assertive">
          <Text style={styles.errorTxt}>{error.message}</Text>
          {canRetry && (
            <TouchableOpacity style={styles.retry} onPress={() => ask(messages)} accessibilityRole="button" accessibilityLabel="Try again">
              <Text style={styles.retryTxt}>Try again</Text>
            </TouchableOpacity>
          )}
          {error.handoff && <TalkToPersonButton />}
        </View>
      )}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question"
          placeholderTextColor="#6b7280"
          multiline
          maxLength={500}
          accessibilityLabel="Message"
        />
        <TouchableOpacity
          style={[styles.send, (!input.trim() || loading) && { opacity: 0.5 }]}
          onPress={send}
          disabled={!input.trim() || loading}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Text style={styles.sendTxt}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerBtn: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 6 },
  headerTxt: { fontSize: 16, color: '#1a56db', fontWeight: '600' },
  empty: { fontSize: 16, color: '#374151', textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
  errorBox: { margin: 8, padding: 10, backgroundColor: '#fde8e8', borderRadius: 8 },
  errorTxt: { fontSize: 15, color: '#7f1d1d' },
  retry: { minHeight: 44, justifyContent: 'center' },
  retryTxt: { fontSize: 16, color: '#1a56db', fontWeight: '700' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, borderTopWidth: 1, borderColor: '#d1d5db' },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderWidth: 1, borderColor: '#6b7280', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 16, color: '#111827' },
  send: { backgroundColor: '#1a56db', minHeight: 48, minWidth: 64, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 8, borderRadius: 8 },
  sendTxt: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
