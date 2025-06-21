
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useEffect } from 'react';

export default function ReturnToMainApp() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainDrawer' }],
      })
    );
  }, [navigation]);

  return null;
}
