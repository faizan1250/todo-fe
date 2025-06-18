import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from '../api/AxiosInstance';
import { useAuth } from '../context/AuthContext';

export default function NicknameModal() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { friendId } = route.params;
  const [nickname, setNickname] = useState('');
  const { token } = useAuth();

  const handleSetNickname = async () => {
    try {
      await axios.post('/friends/set-nickname', { friendId, nickname }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Nickname updated');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not update nickname');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Nickname</Text>
      <TextInput
        style={styles.input}
        value={nickname}
        onChangeText={setNickname}
        placeholder="Enter nickname"
        placeholderTextColor="#888"
      />
      <Button title="Save" onPress={handleSetNickname} color="#00ffcc" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0e0e0e',
    flex: 1,
    padding: 20,
  },
  label: {
    color: '#00ffcc',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 12,
    fontFamily: 'PressStart2P',
    fontSize: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
});
