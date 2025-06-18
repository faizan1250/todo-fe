import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MonsterProps {
  size: number; // scale factor
}

export default function Monster({ size }: MonsterProps) {
  return (
    <View style={[styles.monster, { transform: [{ scale: size }] }]}>
      <Text style={styles.text}>👾</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monster: {
    marginVertical: 20,
  },
  text: {
    fontSize: 50,
  },
});
