
// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import NicknameModal from '../screens/NicknameModal';
import MainDrawer from './MainDrawer';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen'; // Import here
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: 'PressStart2P', fontSize: 12, color: '#00ffcc' },
        headerStyle: { backgroundColor: '#0e0e0e' },
        headerTintColor: '#00ffcc',
      }}
    >
      {token ? (
        <>
          {/* Hide header on drawer root since drawer manages its own header */}
          <Stack.Screen name="MainDrawer" component={MainDrawer} options={{ headerShown: false }} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="AddFriend" component={AddFriendScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="NicknameModal" component={NicknameModal} options={{ presentation: 'modal' }} />

          {/* ChallengeDetail outside drawer for stack navigation */}
          {/* <Stack.Screen
            name="ChallengeDetail"
            component={ChallengeDetailScreen}
            options={{ title: 'Challenge Detail' }}
          /> */}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}


