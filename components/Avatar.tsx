import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string;
  size?: number;
}

const colors = ['#26dbc3', '#facc15', '#f87171', '#4ade80', '#60a5fa'];

const Avatar: React.FC<AvatarProps> = ({ name, size = 40 }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const colorIndex = (name.charCodeAt(0) % colors.length);
  const backgroundColor = colors[colorIndex];

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.text, { fontSize: size / 2.5 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Avatar;