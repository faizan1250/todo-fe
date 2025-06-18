import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import axiosInstance from '../api/AxiosInstance';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFriend'>;

export default function AddFriendScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const { token } = useAuth();

  const handleAdd = async () => {
    try {
      await axiosInstance.post(
        '/friends/add',
        { friendEmail: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Friend added!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to add friend');
    }
  };

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
    <View style={styles.container}>
      <Text style={styles.label}>Enter Friend's Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="friend@example.com"
        placeholderTextColor="#888"
      />
      <Button title="Add Friend" onPress={handleAdd} color="#00ffcc" />
    </View>
    </SafeAreaView>
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
