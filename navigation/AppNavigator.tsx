// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import NicknameModal from '../screens/NicknameModal';
import MainDrawer from './MainDrawer';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from './types';
import TodoDrawerNavigator from './TodoDrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          {/* Main app with drawer navigation */}
          <Stack.Screen name="MainDrawer" component={MainDrawer} />

          {/* Independent Todo module with its own drawer/header */}
          <Stack.Screen name="TodoModule" component={TodoDrawerNavigator} />

          {/* Modals and other screens */}
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="AddFriend" component={AddFriendScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="NicknameModal" component={NicknameModal} options={{ presentation: 'modal' }} />

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

