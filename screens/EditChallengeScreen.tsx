// EditChallengeScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { EditChallengeParamList } from '../navigation/types';

export default function EditChallengeScreen() {
 const route = useRoute<RouteProp<EditChallengeParamList, 'EditChallenge'>>();
  const navigation = useNavigation();
  const { token, user } = useAuth();
const { challenge } = route.params;

  const [title, setTitle] = useState(challenge.title);
  const [description, setDescription] = useState(challenge.description || '');
  const [totalHours, setTotalHours] = useState(String(challenge.totalHours));
  const [durationDays, setDurationDays] = useState(String(challenge.durationDays));
  const [totalPoints, setTotalPoints] = useState(String(challenge.totalPoints));
  const [startDate, setStartDate] = useState(new Date(challenge.startDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hashtags, setHashtags] = useState((challenge.hashtags || []).join(', '));

  const isWaiting = challenge.status === 'Waiting';

  const handleSave = async () => {
    if (!title || !totalHours || !durationDays || !totalPoints) {
      Alert.alert('Missing fields', 'Please fill in all required fields');
      return;
    }

    try {
      const payload: any = {
        title,
        description,
        totalHours: Number(totalHours),
        durationDays: Number(durationDays),
        totalPoints: Number(totalPoints),
        hashtags: hashtags.split(',').map((tag: string) => tag.trim()),
      };

      if (isWaiting) {
        payload.startDate = startDate;
      }

      await axiosInstance.put(`/challenges/${challenge._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Challenge updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update challenge');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Challenge</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Total Hours"
        keyboardType="numeric"
        value={totalHours}
        onChangeText={setTotalHours}
      />

      <TextInput
        style={styles.input}
        placeholder="Duration Days"
        keyboardType="numeric"
        value={durationDays}
        onChangeText={setDurationDays}
      />

      <TextInput
        style={styles.input}
        placeholder="Total Points"
        keyboardType="numeric"
        value={totalPoints}
        onChangeText={setTotalPoints}
      />

      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)}
        disabled={!isWaiting}
      >
        <Text style={[styles.dateButton, !isWaiting && { opacity: 0.5 }]}>Start Date: {startDate.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Hashtags (comma separated)"
        value={hashtags}
        onChangeText={setHashtags}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    padding: 20,
  },
  header: {
    color: '#00ffcc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    borderWidth: 1,
    color: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
  dateButton: {
    color: '#00ffcc',
    marginBottom: 15,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#00ffcc',
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#0e0e0e',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});