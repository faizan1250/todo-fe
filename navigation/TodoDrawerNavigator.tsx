// // navigation/TodoDrawerNavigator.tsx
// import React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Ionicons } from '@expo/vector-icons';
// import TodoStackNavigator from './TodoStackNavigator';
// import ReturnToMainApp from '../screens/Todo/ReturnToMainApp';

// const Drawer = createDrawerNavigator();

// export default function TodoDrawerNavigator() {
//   return (
//     <Drawer.Navigator
//       screenOptions={{
//         headerShown: true,
//         headerStyle: { backgroundColor: '#121212' },
//         headerTintColor: '#26dbc3',
//         headerTitleStyle: { fontSize: 16, fontWeight: '600' },
//         drawerStyle: { backgroundColor: '#121212' },
//         drawerActiveTintColor: '#26dbc3',
//         drawerLabelStyle: {
//           fontSize: 12,
//           fontWeight: '500',
//           color: '#ffffff',
//         },
//       }}
//     >
//       <Drawer.Screen
//         name="TodoHomeStack"
//         component={TodoStackNavigator}
//         options={{
//           title: 'Todos',
//           drawerIcon: ({ color, size }) => <Ionicons name="checkbox-outline" size={size} color={color} />,
//         }}
//       />
//       <Drawer.Screen
//         name="MainApp"
//         component={ReturnToMainApp}
//         options={{
//           title: 'Return to App',
//           drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
//         }}
//       />
//     </Drawer.Navigator>
//   );
// }
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import TodoStackNavigator from './TodoStackNavigator';
import ReturnToMainApp from '../screens/Todo/ReturnToMainApp';

import CreateTodo from '../screens/Todo/CreateTodo';
import TodoCalendar from '../screens/Todo/TodoCalendar';
import TodoStats from '../screens/Todo/TodoStats';

const Drawer = createDrawerNavigator();

export default function TodoDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#26dbc3',
        headerTitleStyle: { fontSize: 16, fontWeight: '600' },
        drawerStyle: { backgroundColor: '#121212' },
        drawerActiveTintColor: '#26dbc3',
        drawerLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          color: '#ffffff',
        },
      }}
    >
      <Drawer.Screen
        name="TodoHomeStack"
        component={TodoStackNavigator}
        options={{
          title: 'Todos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="CreateTodo"
        component={CreateTodo}
        options={{
          title: 'Create Todo',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="TodoCalendar"
        component={TodoCalendar}
        options={{
          title: 'Calendar',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="TodoStats"
        component={TodoStats}
        options={{
          title: 'Statistics',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* <Drawer.Screen
        name="MainApp"
        component={ReturnToMainApp}
        options={{
          title: 'Return to App',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
}
