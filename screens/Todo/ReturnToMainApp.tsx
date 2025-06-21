// screens/Todo/ReturnToMainApp.tsx
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export default function ReturnToMainApp() {
  const navigation = useNavigation();

  useEffect(() => {
    // Go up to the root navigator that contains both MainDrawer and TodoModule
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainDrawer' }],
      })
    );
  }, [navigation]);

  return null;
}