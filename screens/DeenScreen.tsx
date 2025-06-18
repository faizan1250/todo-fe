import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeenScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
    <View style={styles.container}>
      <Text style={styles.title}>Deen Screen</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#00ffcc',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
  },
});

export default DeenScreen;
