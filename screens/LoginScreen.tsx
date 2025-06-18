import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axiosInstance from '../api/AxiosInstance';
import { useAuth } from '../context/AuthContext';
import { useFonts } from 'expo-font';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fontsLoaded] = useFonts({
    'PressStart2P': require('../assets/fonts/PressStart2P-Regular.ttf'),
  });

const handleLogin = async () => {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const user = {
      id: res.data.user._id,
      name: res.data.user.name,
      email: res.data.user.email,
      nickname: res.data.user.nickname ?? null,
      profilePicUrl: res.data.user.profilePic,

    };
    console.log('Login success user:', user);
    login(res.data.token, user);
  } catch (err: any) {
    console.log('Axios error response:', err.response?.data);
    alert(err.response?.data.msg || 'Login failed');
  }
};

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Login kar bhosdike</Text>

      <View style={styles.box}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="chootpagal@example.com"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#888"
        />

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerText}>Register Instead</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  box: {
    width: '85%',
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#aaa',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 8,
  },
  button: {
    backgroundColor: '#00ffcc',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#000',
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
});
