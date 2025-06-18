import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Button, StyleSheet } from 'react-native';

import axios from 'axios';
import Monster from '../components/Monster';

const BACKEND_URL = 'http://localhost:5000/api/timer'; // Change to your backend URL

const userId = 'YOUR_USER_ID'; // For demo: replace with real auth system later

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [coins, setCoins] = useState(0);

  // Change here: React Native setInterval returns a number, not NodeJS.Timer
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          if (newSeconds % 10 === 0) {
            addCoins(1);
          }
          return newSeconds;
        });
      }, 1000);
     
    } else if (!isRunning && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  async function addCoins(amount: number) {
    try {
      const res = await axios.post(`${BACKEND_URL}/coins/add`, { userId, coins: amount });
      setCoins(res.data.coins);
    } catch (err) {
      console.log('Error adding coins', err);
    }
  }

  async function saveSession() {
    try {
      await axios.post(`${BACKEND_URL}/log`, { userId, duration: seconds });
      alert('Session saved!');
    } catch (err) {
      console.log('Error saving session', err);
    }
  }

  function reset() {
    setSeconds(0);
    setIsRunning(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  return (
    
     
    <View style={styles.container}>
      <Text style={styles.timer}>{new Date(seconds * 1000).toISOString().substr(14, 5)}</Text>
      <Monster size={Math.min(1 + seconds / 60, 2)} />
      <Text style={styles.coins}>Coins: {coins}</Text>

      <View style={styles.buttons}>
        {!isRunning ? (
          <Button title="Start" onPress={() => setIsRunning(true)} />
        ) : (
          <Button title="Pause" onPress={() => setIsRunning(false)} />
        )}
        <Button title="Reset" onPress={reset} />
        <Button title="Save" onPress={saveSession} />
      </View>
    </View>

 
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timer: { fontSize: 48, fontFamily: 'PressStart2P', marginBottom: 20 },
  coins: { fontSize: 20, marginVertical: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginTop: 20 },
});
