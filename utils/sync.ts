import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_KEY = 'lastSyncTimestamp';

export const getLastSync = async () => {
  return await AsyncStorage.getItem(SYNC_KEY);
};

export const setLastSync = async (iso: string) => {
  await AsyncStorage.setItem(SYNC_KEY, iso);
};
