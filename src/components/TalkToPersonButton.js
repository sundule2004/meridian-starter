import React from 'react';
import { TouchableOpacity, Text, Alert, Linking, StyleSheet } from 'react-native';

// Contact details are demo values: replace with the firm's real addresses.
const HR_EMAIL = 'hr@meridian.example';
const IT_EMAIL = 'it-helpdesk@meridian.example';

// "Talk to a person" hand-over: shows the HR / IT help desk options.
export default function TalkToPersonButton() {
  const onPress = () => {
    Alert.alert(
      'Talk to a person',
      'The IT help desk is available 08:00 to 18:00 on working days. Choose who to contact:',
      [
        { text: 'Email HR', onPress: () => Linking.openURL(`mailto:${HR_EMAIL}?subject=Help%20needed`) },
        { text: 'Email IT help desk', onPress: () => Linking.openURL(`mailto:${IT_EMAIL}?subject=Help%20needed`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Talk to a person"
    >
      <Text style={styles.label}>Talk to a person</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#b45309', borderRadius: 8, paddingHorizontal: 12, marginTop: 6 },
  label: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
