
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { createTodo, joinTodoByCode } from '../../api/Todoapi';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

type Priority = 'low' | 'medium' | 'high';
type RepeatInterval = 'none' | 'daily' | 'weekly' | 'monthly';
type Status = 'todo' | 'in-progress' | 'done' | 'archived';

export default function CreateTodo() {
  const { token, user } = useAuth();
  const navigation = useNavigation();

  // Form state - matches Todo model
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [assignedPoints, setAssignedPoints] = useState('0');
  const [subtasks, setSubtasks] = useState([{ title: '', done: false }]);
  const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>('none');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinInput, setJoinInput] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [currentDateField, setCurrentDateField] = useState<'start' | 'end' | 'due' | 'reminder' | null>(null);

  // Reset form when screen loses focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      resetForm();
    });

    return unsubscribe;
  }, [navigation]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setAssignedPoints('0');
    setSubtasks([{ title: '', done: false }]);
    setRepeatInterval('none');
    setCategory('');
    setTags([]);
    setStartTime(null);
    setEndTime(null);
    setDueDate(null);
    setReminder(null);
    setIsStarred(false);
    setJoinCode('');
    setJoinInput('');
  };

  const handleAddSubtask = () => setSubtasks([...subtasks, { title: '', done: false }]);

  const handleRemoveSubtask = (index: number) => {
    if (subtasks.length > 1) {
      const updated = subtasks.filter((_, i) => i !== index);
      setSubtasks(updated);
    }
  };

  const handleChangeSubtask = (index: number, text: string) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], title: text };
    setSubtasks(updated);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const updated = tags.filter((_, i) => i !== index);
    setTags(updated);
  };

  const showDateTimePicker = (field: 'start' | 'end' | 'due' | 'reminder') => {
    setCurrentDateField(field);
    setDatePickerMode('date');
    
    if (Platform.OS === 'android') {
      const currentValue = 
        field === 'start' ? startTime : 
        field === 'end' ? endTime : 
        field === 'due' ? dueDate : 
        reminder;
      
      DateTimePickerAndroid.open({
        value: currentValue || new Date(),
        mode: 'date',
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: (e, timeDate) => {
                if (e.type === 'set' && timeDate) {
                  const finalDateTime = new Date(
                    selectedDate.setHours(timeDate.getHours(), timeDate.getMinutes())
                  );
                  switch (field) {
                    case 'start': setStartTime(finalDateTime); break;
                    case 'end': setEndTime(finalDateTime); break;
                    case 'due': setDueDate(finalDateTime); break;
                    case 'reminder': setReminder(finalDateTime); break;
                  }
                }
              },
            });
          }
        },
      });
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate && currentDateField) {
      if (datePickerMode === 'date') {
        setDatePickerMode('time');
      } else {
        switch (currentDateField) {
          case 'start': setStartTime(selectedDate); break;
          case 'end': setEndTime(selectedDate); break;
          case 'due': setDueDate(selectedDate); break;
          case 'reminder': setReminder(selectedDate); break;
        }
        setCurrentDateField(null);
      }
    } else {
      setCurrentDateField(null);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }

    const points = parseInt(assignedPoints);
    if (isNaN(points) || points < 0) {
      Alert.alert('Validation Error', 'Points must be a non-negative number');
      return false;
    }

    if (startTime && endTime && startTime >= endTime) {
      Alert.alert('Validation Error', 'End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!token) return;

    setIsLoading(true);
    try {
      const todoData = {
        title,
        description,
        priority,
        status,
        category,
        tags,
        assignedPoints: parseInt(assignedPoints),
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
        dueDate: dueDate?.toISOString(),
        reminder: reminder?.toISOString(),
        subtasks: subtasks.filter(s => s.title.trim()),
        repeatInterval,
        isStarred,
      };

      const response = await createTodo(todoData, token);
      
      if (response?.joinCode) {
        setJoinCode(response.joinCode);
        Alert.alert('Todo Created', `Share this code to collaborate: ${response.joinCode}`);
      } else {
        Alert.alert('Success', 'Todo created successfully');
      }

      resetForm();
      navigation.goBack();
    } catch (error: any) {
      console.error('Create todo error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create todo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinInput.trim()) return;
    if (!token) return;

    setIsLoading(true);
    try {
      const result = await joinTodoByCode(joinInput.trim(), token);
      Alert.alert('Success', `Joined todo: ${result.todo.title}`);
      setJoinInput('');
      navigation.goBack();
    } catch (error: any) {
      console.error('Join error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to join todo');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#26dbc3" />
          ) : (
            <Text style={styles.save}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Basic Information Section */}
      <Text style={styles.sectionHeader}>Basic Information</Text>
      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Enter task title"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Enter description"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          placeholder="e.g. Work, Study, Fitness"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.tagInputContainer}>
          <TextInput
            value={currentTag}
            onChangeText={setCurrentTag}
            style={[styles.input, { flex: 1 }]}
            placeholder="Add tag"
            placeholderTextColor="#666"
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
            <Text style={styles.addTagText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Section */}
      <Text style={styles.sectionHeader}>Time Management</Text>
      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity 
          onPress={() => showDateTimePicker('start')} 
          style={styles.input}
        >
          <Text style={{ color: startTime ? '#fff' : '#666' }}>
            {formatDate(startTime)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>End Time</Text>
        <TouchableOpacity 
          onPress={() => showDateTimePicker('end')} 
          style={styles.input}
        >
          <Text style={{ color: endTime ? '#fff' : '#666' }}>
            {formatDate(endTime)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity 
          onPress={() => showDateTimePicker('due')} 
          style={styles.input}
        >
          <Text style={{ color: dueDate ? '#fff' : '#666' }}>
            {formatDate(dueDate)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Reminder</Text>
        <TouchableOpacity 
          onPress={() => showDateTimePicker('reminder')} 
          style={styles.input}
        >
          <Text style={{ color: reminder ? '#fff' : '#666' }}>
            {formatDate(reminder)}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && currentDateField && (
          <DateTimePicker
            value={currentDateField === 'start' ? startTime || new Date() :
                   currentDateField === 'end' ? endTime || new Date() :
                   currentDateField === 'due' ? dueDate || new Date() :
                   reminder || new Date()}
            mode={datePickerMode}
            display="spinner"
            onChange={handleDateTimeChange}
          />
        )}
      </View>

      {/* Settings Section */}
      <Text style={styles.sectionHeader}>Settings</Text>
      <View style={styles.sectionContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Starred</Text>
          <Switch
            value={isStarred}
            onValueChange={setIsStarred}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isStarred ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {['low', 'medium', 'high'].map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityButton, 
                priority === p && styles.prioritySelected, 
                { borderColor: PRIORITY_COLORS[p] }
              ]}
              onPress={() => setPriority(p as Priority)}
            >
              <Text style={{ color: PRIORITY_COLORS[p] }}>{p.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.priorityRow}>
          {['todo', 'in-progress', 'done', 'archived'].map(s => (
            <TouchableOpacity
              key={s}
              style={[
                styles.priorityButton, 
                status === s && styles.prioritySelected
              ]}
              onPress={() => setStatus(s as Status)}
            >
              <Text style={{ color: '#26dbc3' }}>{s.toUpperCase().replace('-', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Repeat</Text>
        <View style={styles.priorityRow}>
          {['none', 'daily', 'weekly', 'monthly'].map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityButton, 
                repeatInterval === p && styles.prioritySelected
              ]}
              onPress={() => setRepeatInterval(p as RepeatInterval)}
            >
              <Text style={{ color: '#26dbc3' }}>{p.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Points</Text>
        <TextInput
          value={assignedPoints}
          onChangeText={setAssignedPoints}
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 10"
          placeholderTextColor="#666"
        />
      </View>

      {/* Subtasks Section */}
      <Text style={styles.sectionHeader}>Subtasks</Text>
      <View style={styles.sectionContainer}>
        {subtasks.map((task, i) => (
          <View key={i} style={styles.subtaskContainer}>
            <TextInput
              value={task.title}
              onChangeText={text => handleChangeSubtask(i, text)}
              style={[styles.input, { flex: 1 }]}
              placeholder={`Subtask ${i + 1}`}
              placeholderTextColor="#666"
            />
            {subtasks.length > 1 && (
              <TouchableOpacity 
                onPress={() => handleRemoveSubtask(i)}
                style={styles.removeSubtaskButton}
              >
                <Text style={styles.removeSubtaskText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={handleAddSubtask} style={styles.addSubtaskButton}>
          <Text style={styles.addSubtaskText}>+ Add Subtask</Text>
        </TouchableOpacity>
      </View>

      {/* Collaboration Section */}
      <Text style={styles.sectionHeader}>Collaboration</Text>
      <View style={styles.sectionContainer}>
        {joinCode ? (
          <View style={styles.codeContainer}>
            <Text style={styles.label}>Share this code to invite others:</Text>
            <Text style={styles.codeText}>{joinCode}</Text>
            <Text style={styles.noteText}>Others can join by entering this code</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Join Existing Todo</Text>
            <View style={styles.joinContainer}>
              <TextInput
                value={joinInput}
                onChangeText={setJoinInput}
                placeholder="Enter Join Code"
                placeholderTextColor="#666"
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity 
                onPress={handleJoinByCode}
                style={styles.joinButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.joinButtonText}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Required for iOS DateTimePicker */}
      {Platform.OS === 'ios' && currentDateField && (
        <View style={styles.dateTimePickerContainer}>
          <DateTimePicker
            value={
              currentDateField === 'start' ? startTime || new Date() :
              currentDateField === 'end' ? endTime || new Date() :
              currentDateField === 'due' ? dueDate || new Date() :
              reminder || new Date()
            }
            mode={datePickerMode}
            display="spinner"
            onChange={handleDateTimeChange}
          />
          <TouchableOpacity 
            onPress={() => setCurrentDateField(null)}
            style={styles.datePickerDoneButton}
          >
            <Text style={styles.datePickerDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#f87171',
};

const STATUS_COLORS: Record<string, string> = {
  'todo': '#60a5fa',
  'in-progress': '#f59e0b',
  'done': '#10b981',
  'archived': '#9ca3af',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancel: {
    color: '#f87171',
    fontSize: 16,
  },
  save: {
    color: '#26dbc3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: '#26dbc3',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
  },
  sectionContainer: {
    backgroundColor: '#121212',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    color: '#aaa',
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  priorityButton: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderColor: '#333',
  },
  prioritySelected: {
    backgroundColor: '#1a1a1a',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  removeSubtaskButton: {
    backgroundColor: '#f87171',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSubtaskText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addSubtaskButton: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addSubtaskText: {
    color: '#a78bfa',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  tagText: {
    color: '#fff',
  },
  tagRemove: {
    color: '#f87171',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  addTagButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addTagText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  joinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  joinButton: {
    backgroundColor: '#60a5fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  codeContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  codeText: {
    color: '#26dbc3',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  noteText: {
    color: '#aaa',
    fontSize: 12,
  },
  dateTimePickerContainer: {
    backgroundColor: '#121212',
    padding: 20,
  },
  datePickerDoneButton: {
    backgroundColor: '#26dbc3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  datePickerDoneText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});