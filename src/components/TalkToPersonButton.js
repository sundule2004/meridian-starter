import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

// "Talk to a person" hand-over. Not used anywhere yet.
export default function TalkToPersonButton() {
  const onPress = () => {
    // TODO: show the HR / IT help desk contact options
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Text>Talk to a person</Text>
    </TouchableOpacity>
  );
}
