// navigation/TodoStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodoHome from '../screens/Todo/TodoHome';
import CreateTodo from '../screens/Todo/CreateTodo';
import TodoDetailsScreen from '../screens/Todo/TodoDetailsScreen';
export type TodoStackParamList = {
  TodoHome: undefined;
  CreateTodo: undefined;
  EditTodo: { todoId: string };
  TodoCalendar: undefined;
  TodoStats: undefined;
 TodoDetails: { todoId: string };
   Leaderboard: undefined; // ✅ add this line
};

const Stack = createNativeStackNavigator<TodoStackParamList>();

export default function TodoStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="TodoHome"
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#26dbc3',
        headerTitleStyle: {
          fontFamily: 'System',
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="TodoHome"
        component={TodoHome}
        //options={{ title: 'Your Todos' }}
      />
      <Stack.Screen
        name="CreateTodo"
        component={CreateTodo}
        options={{ title: 'New Task' }}
      />
      <Stack.Screen 
  name="TodoDetails" 
  component={TodoDetailsScreen} 
  options={{ title: 'Todo Details' }}
/>
    </Stack.Navigator>
  );
}
