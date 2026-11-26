// Reference chat screen showing the fixes for Tasks 2, 4, 6 and 7. Adapt names to your starter.
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet, Alert, Linking,
} from 'react-native';
import { askAssistant } from '../lib/api';
import { getUserId } from '../lib/auth';
import { createConversation, addMessage, getMessages } from '../lib/db';
import { speak, stopSpeaking } from '../lib/speech';

export default function ChatScreen({ route, navigation }) {
  const [convId, setConvId] = useState(route?.params?.conversationId ?? null);
  const [messages, setMessages] = useState([]);   // [{id, role, content, handoff}]
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHuman, setShowHuman] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const listRef = useRef(null);

  // Reopen a past conversation from local SQLite (works offline).
  useEffect(() => {
    if (convId) getMessages(convId).then(rows => setMessages(rows.map(r => ({ ...r, handoff: !!r.handoff }))));
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;           // fault fix: no empty / double sends
    setInput(''); setError(null); setLoading(true);

    let id = convId;
    if (!id) { id = await createConversation(await getUserId(), text); setConvId(id); }
    const userMsg = { id: `u${Date.now()}`, role: 'user', content: text };
    const next = [...messages, userMsg];    // fault fix: never mutate state with push()
    setMessages(next);
    await addMessage(id, 'user', text);

    try {
      // Task 4(b): full history is what gives the model its context.
      const { reply, handoff } = await askAssistant(next.map(m => ({ role: m.role, content: m.content })));
      setMessages(cur => [...cur, { id: `a${Date.now()}`, role: 'assistant', content: reply, handoff }]);
      await addMessage(id, 'assistant', reply, handoff);
      if (handoff) setShowHuman(true);
    } catch (e) {
      if (e.code === 'AUTH') { navigation.replace('Login'); return; }
      setError(e.message);                   // helpful message instead of a crash
      if (e.handoff) setShowHuman(true);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, convId]);

  const talkToPerson = () =>
    Alert.alert('Talk to a person', 'The IT help desk is available 08:00 to 18:00 on working days. Your conversation will be saved so you can show it to them.',
      [{ text: 'Close' }, { text: 'Email HR/IT', onPress: () => Linking.openURL('mailto:helpdesk@meridian.example') }]);

  const toggleSpeak = (m) => {
    if (speakingId === m.id) { stopSpeaking(); setSpeakingId(null); return; }
    stopSpeaking(); setSpeakingId(m.id);
    speak(m.content, () => setSpeakingId(null));
  };

  const renderItem = ({ item }) => {
    const mine = item.role === 'user';
    return (
      <View style={[s.row, mine ? s.rowMine : s.rowBot]}>
        <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleBot]}>
          <Text style={[s.text, mine && { color: '#fff' }]}>{item.content}</Text>
          {!mine && (
            <TouchableOpacity style={s.speakBtn} onPress={() => toggleSpeak(item)}
              accessibilityRole="button"
              accessibilityLabel={speakingId === item.id ? 'Stop reading aloud' : 'Read this reply aloud'}>
              <Text style={s.speakTxt}>{speakingId === item.id ? '■ Stop' : '🔊 Listen'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => String(m.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={s.empty}>Ask about leave, expenses, remote working, passwords or IT support.</Text>}
      />
      {loading && (
        <View style={s.status} accessibilityLiveRegion="polite">
          <ActivityIndicator /><Text style={s.statusTxt}>  Assistant is typing…</Text>
        </View>
      )}
      {error && <Text style={s.error} accessibilityLiveRegion="assertive">{error}</Text>}
      {showHuman && (
        <TouchableOpacity style={s.humanBtn} onPress={talkToPerson} accessibilityRole="button"
          accessibilityLabel="Talk to a person">
          <Text style={s.humanTxt}>Talk to a person</Text>
        </TouchableOpacity>
      )}
      <View style={s.inputRow}>
        <TextInput style={s.input} value={input} onChangeText={setInput} placeholder="Type your question"
          placeholderTextColor="#595959" multiline maxLength={500} accessibilityLabel="Message input" />
        <TouchableOpacity style={[s.send, (!input.trim() || loading) && { opacity: 0.5 }]} onPress={send}
          disabled={!input.trim() || loading} accessibilityRole="button" accessibilityLabel="Send message">
          <Text style={s.sendTxt}>Send</Text>
        </TouchableOpacity>
      </View>
      {/* The user can always ask for a person, even if the bot never offers it. */}
      {!showHuman && (
        <TouchableOpacity onPress={() => setShowHuman(true)} style={s.link} accessibilityRole="button"
          accessibilityLabel="Need a person? Show human help option">
          <Text style={s.linkTxt}>Need a person?</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

// Accessibility: >=16px text, >=44px targets, contrast >= 4.5:1, no fixed widths (works on 360px screens).
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FA' },
  row: { marginVertical: 4, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' }, rowBot: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 12 },
  bubbleMine: { backgroundColor: '#1F4E9C' }, bubbleBot: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D0D5DD' },
  text: { fontSize: 16, lineHeight: 22, color: '#111827', flexShrink: 1 },
  speakBtn: { minHeight: 44, justifyContent: 'center' }, speakTxt: { fontSize: 14, color: '#1F4E9C', fontWeight: '600' },
  empty: { fontSize: 16, color: '#374151', textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
  status: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  statusTxt: { fontSize: 14, color: '#374151' },
  error: { fontSize: 14, color: '#9B1C1C', backgroundColor: '#FDECEC', padding: 10, marginHorizontal: 12, borderRadius: 8 },
  humanBtn: { backgroundColor: '#B45309', margin: 12, minHeight: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  humanTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#D0D5DD' },
  input: { flex: 1, minHeight: 48, maxHeight: 120, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#9CA3AF', borderRadius: 10, paddingHorizontal: 12 },
  send: { minHeight: 48, minWidth: 64, marginLeft: 8, backgroundColor: '#1F4E9C', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sendTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center' }, linkTxt: { fontSize: 14, color: '#1F4E9C', textDecorationLine: 'underline' },
});
