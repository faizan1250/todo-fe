
// navigation/MainDrawer.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/HomeScreen';

import DeenScreen from '../screens/DeenScreen';
import ChallengeListScreen from '../screens/ChallengeListScreen';
import CreateChallengeScreen from '../screens/CreateChallengeScreen';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';
import StatsScreen from '../screens/StatsScreen';


const Drawer = createDrawerNavigator();

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0e0e0e' },
        headerTintColor: '#00ffcc',
        headerTitleStyle: {
          fontFamily: 'PressStart2P',
          fontSize: 12,
        },
        drawerStyle: {
          backgroundColor: '#0e0e0e',
        },
        drawerLabelStyle: {
          fontFamily: 'PressStart2P',
          fontSize: 10,
          color: '#00ffcc',
        },
        drawerActiveTintColor: '#00ffcc',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      
      <Drawer.Screen name="Deen" component={DeenScreen} />

      <Drawer.Screen name="Challenges" component={ChallengeListScreen} />
      {/* <Drawer.Screen name="CreateChallenge" component={CreateChallengeScreen} /> */}
        <Drawer.Screen
    name="CreateChallenge"
    component={CreateChallengeScreen}
    options={{ drawerItemStyle: { display: 'none' } }}
  />
      <Drawer.Screen name="Stats" component={StatsScreen} />

      {/* <Drawer.Screen
  name="ChallengeDetail"
  component={ChallengeDetailScreen}
  options={{ title: 'Challenge Detail (Temp)' }}
/> */}
  <Drawer.Screen
    name="ChallengeDetail"
    component={ChallengeDetailScreen}
    options={{ drawerItemStyle: { display: 'none' } }}
  />

    </Drawer.Navigator>
  );
}
