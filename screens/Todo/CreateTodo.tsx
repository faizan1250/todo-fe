
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Platform,
// } from 'react-native';
// import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
// import { createTodo } from '../../api/Todoapi';
// import { useNavigation } from '@react-navigation/native';
// import { useAuth } from '../../context/AuthContext';

// export default function CreateTodo() {
//   const { token } = useAuth();
//   const navigation = useNavigation();

//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
//   const [assignedPoints, setAssignedPoints] = useState('0');
//   const [subtasks, setSubtasks] = useState<string[]>(['']);
//   const [repeatInterval, setRepeatInterval] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
//   const [category, setCategory] = useState('');
//   const [startTime, setStartTime] = useState<Date | null>(null);
//   const [endTime, setEndTime] = useState<Date | null>(null);

//   const handleAddSubtask = () => setSubtasks([...subtasks, '']);

//   const handleChangeSubtask = (index: number, text: string) => {
//     const updated = [...subtasks];
//     updated[index] = text;
//     setSubtasks(updated);
//   };

//   const openDateTimePicker = (setter: (date: Date) => void, defaultDate: Date) => {
//     DateTimePickerAndroid.open({
//       value: defaultDate,
//       mode: 'date',
//       is24Hour: true,
//       onChange: (event, selectedDate) => {
//         if (event.type === 'set' && selectedDate) {
//           DateTimePickerAndroid.open({
//             value: selectedDate,
//             mode: 'time',
//             is24Hour: true,
//             onChange: (e, timeDate) => {
//               if (e.type === 'set' && timeDate) {
//                 const finalDateTime = new Date(
//                   selectedDate.setHours(timeDate.getHours(), timeDate.getMinutes())
//                 );
//                 setter(finalDateTime);
//               }
//             },
//           });
//         }
//       },
//     });
//   };

//   const handleSubmit = async () => {
//     if (!title.trim()) return Alert.alert('Validation', 'Title is required');
//     const parsedPoints = parseInt(assignedPoints || '0');
//     if (isNaN(parsedPoints) || parsedPoints < 0) return Alert.alert('Validation', 'Points must be a non-negative number');

//     try {
//       await createTodo({
//         title,
//         description,
//         priority,
//         category,
//         assignedPoints: parsedPoints,
//         startTime: startTime?.toISOString(),
//         endTime: endTime?.toISOString(),
//         subtasks: subtasks.filter(s => s.trim()).map(s => ({ title: s.trim(), done: false })),
//         repeatInterval,
//       }, token!);
//       navigation.goBack();
//     } catch (err) {
//       Alert.alert('Error', 'Failed to create todo');
//       console.error(err);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.cancel}>Cancel</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSubmit}>
//           <Text style={styles.save}>Save</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.label}>Category</Text>
//       <TextInput
//         value={category}
//         onChangeText={setCategory}
//         style={styles.input}
//         placeholder="e.g. Work, Study, Fitness"
//         placeholderTextColor="#666"
//       />

//       <Text style={styles.label}>Title</Text>
//       <TextInput
//         value={title}
//         onChangeText={setTitle}
//         style={styles.input}
//         placeholder="Enter task title"
//         placeholderTextColor="#666"
//       />

//       <Text style={styles.label}>Description</Text>
//       <TextInput
//         value={description}
//         onChangeText={setDescription}
//         style={[styles.input, { height: 80 }]}
//         multiline
//         placeholder="Enter description"
//         placeholderTextColor="#666"
//       />

//       <Text style={styles.label}>Start Time</Text>
//       <TouchableOpacity onPress={() => openDateTimePicker(setStartTime, startTime || new Date())} style={styles.input}>
//         <Text style={{ color: startTime ? '#fff' : '#666' }}>{startTime ? startTime.toLocaleString() : 'Set start time'}</Text>
//       </TouchableOpacity>

//       <Text style={styles.label}>End Time</Text>
//       <TouchableOpacity onPress={() => openDateTimePicker(setEndTime, endTime || new Date())} style={styles.input}>
//         <Text style={{ color: endTime ? '#fff' : '#666' }}>{endTime ? endTime.toLocaleString() : 'Set end time'}</Text>
//       </TouchableOpacity>

//       <Text style={styles.label}>Priority</Text>
//       <View style={styles.priorityRow}>
//         {['low', 'medium', 'high'].map(p => (
//           <TouchableOpacity
//             key={p}
//             style={[styles.priorityButton, priority === p && styles.prioritySelected, { borderColor: PRIORITY_COLORS[p] }]}
//             onPress={() => setPriority(p as 'low' | 'medium' | 'high')}
//           >
//             <Text style={{ color: PRIORITY_COLORS[p] }}>{p.toUpperCase()}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <Text style={styles.label}>Repeat</Text>
//       <View style={styles.priorityRow}>
//         {['none', 'daily', 'weekly', 'monthly'].map(p => (
//           <TouchableOpacity
//             key={p}
//             style={[styles.priorityButton, repeatInterval === p && styles.prioritySelected]}
//             onPress={() => setRepeatInterval(p as typeof repeatInterval)}
//           >
//             <Text style={{ color: '#26dbc3' }}>{p.toUpperCase()}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <Text style={styles.label}>Points</Text>
//       <TextInput
//         value={assignedPoints}
//         onChangeText={setAssignedPoints}
//         style={styles.input}
//         keyboardType="numeric"
//         placeholder="e.g. 10"
//         placeholderTextColor="#666"
//       />

//       <Text style={styles.label}>Subtasks</Text>
//       {subtasks.map((task, i) => (
//         <TextInput
//           key={i}
//           value={task}
//           onChangeText={text => handleChangeSubtask(i, text)}
//           style={styles.input}
//           placeholder={`Subtask ${i + 1}`}
//           placeholderTextColor="#666"
//         />
//       ))}
//       <TouchableOpacity onPress={handleAddSubtask}>
//         <Text style={styles.addSubtask}>+ Add a subtask</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const PRIORITY_COLORS: Record<string, string> = {
//   low: '#4ade80',
//   medium: '#facc15',
//   high: '#f87171',
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   cancel: {
//     color: '#f87171',
//     fontSize: 16,
//   },
//   save: {
//     color: '#26dbc3',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   label: {
//     color: '#aaa',
//     marginTop: 16,
//     marginBottom: 6,
//     fontWeight: '500',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#333',
//     padding: 10,
//     borderRadius: 10,
//     color: '#fff',
//   },
//   priorityRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//     marginVertical: 10,
//   },
//   priorityButton: {
//     borderWidth: 1,
//     paddingVertical: 6,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   prioritySelected: {
//     backgroundColor: '#121212',
//   },
//   addSubtask: {
//     color: '#a78bfa',
//     marginTop: 10,
//     fontWeight: '600',
//   },
// });
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
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { createTodo } from '../../api/Todoapi';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function CreateTodo() {
  const { token } = useAuth();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [assignedPoints, setAssignedPoints] = useState('0');
  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const [repeatInterval, setRepeatInterval] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

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
    setPriority('low');
    setAssignedPoints('0');
    setSubtasks(['']);
    setRepeatInterval('none');
    setCategory('');
    setStartTime(null);
    setEndTime(null);
  };

  const handleAddSubtask = () => setSubtasks([...subtasks, '']);

  const handleChangeSubtask = (index: number, text: string) => {
    const updated = [...subtasks];
    updated[index] = text;
    setSubtasks(updated);
  };

  const openDateTimePicker = (setter: (date: Date) => void, defaultDate: Date) => {
    DateTimePickerAndroid.open({
      value: defaultDate,
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
                setter(finalDateTime);
              }
            },
          });
        }
      },
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Validation', 'Title is required');
    const parsedPoints = parseInt(assignedPoints || '0');
    if (isNaN(parsedPoints) || parsedPoints < 0) {
      return Alert.alert('Validation', 'Points must be a non-negative number');
    }

    try {
      await createTodo({
        title,
        description,
        priority,
        category,
        assignedPoints: parsedPoints,
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
        subtasks: subtasks.filter(s => s.trim()).map(s => ({ title: s.trim(), done: false })),
        repeatInterval,
      }, token!);
      resetForm();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to create todo');
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Category</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        style={styles.input}
        placeholder="e.g. Work, Study, Fitness"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Title</Text>
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
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="Enter description"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity 
        onPress={() => openDateTimePicker(setStartTime, startTime || new Date())} 
        style={styles.input}
      >
        <Text style={{ color: startTime ? '#fff' : '#666' }}>
          {startTime ? startTime.toLocaleString() : 'Set start time'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity 
        onPress={() => openDateTimePicker(setEndTime, endTime || new Date())} 
        style={styles.input}
      >
        <Text style={{ color: endTime ? '#fff' : '#666' }}>
          {endTime ? endTime.toLocaleString() : 'Set end time'}
        </Text>
      </TouchableOpacity>

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
            onPress={() => setPriority(p as 'low' | 'medium' | 'high')}
          >
            <Text style={{ color: PRIORITY_COLORS[p] }}>{p.toUpperCase()}</Text>
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
            onPress={() => setRepeatInterval(p as typeof repeatInterval)}
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

      <Text style={styles.label}>Subtasks</Text>
      {subtasks.map((task, i) => (
        <TextInput
          key={i}
          value={task}
          onChangeText={text => handleChangeSubtask(i, text)}
          style={styles.input}
          placeholder={`Subtask ${i + 1}`}
          placeholderTextColor="#666"
        />
      ))}
      <TouchableOpacity onPress={handleAddSubtask}>
        <Text style={styles.addSubtask}>+ Add a subtask</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#f87171',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  label: {
    color: '#aaa',
    marginTop: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    borderRadius: 10,
    color: '#fff',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  priorityButton: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  prioritySelected: {
    backgroundColor: '#121212',
  },
  addSubtask: {
    color: '#a78bfa',
    marginTop: 10,
    fontWeight: '600',
  },
});