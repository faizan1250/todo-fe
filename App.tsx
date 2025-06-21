import React from 'react';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SocketProvider>
    </AuthProvider>
  );
}