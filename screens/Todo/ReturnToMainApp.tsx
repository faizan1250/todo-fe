import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';

export default function ReturnToMainApp() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.dispatch(
      StackActions.replace('MainDrawer') // ⬅️ resets to main app drawer
    );
  }, [navigation]);

  return null; // No UI needed
}
