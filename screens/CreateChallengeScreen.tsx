// // // screens/CreateChallengeScreen.tsx

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { useNavigation } from '@react-navigation/native';
// import { useAuth } from '../context/AuthContext';
// import axiosInstance from '../api/AxiosInstance';
// import { useFocusEffect } from '@react-navigation/native';
// import { useCallback } from 'react';


// export default function CreateChallengeScreen() {
//   const navigation = useNavigation();
//   const { user } = useAuth();

//   const [title, setTitle] = useState('');
//   const [totalHours, setTotalHours] = useState('');
//   const [durationValue, setDurationValue] = useState('7');
//   const [durationUnit, setDurationUnit] = useState('days');
//   const [totalPoints, setTotalPoints] = useState('');
//   useFocusEffect(
//   useCallback(() => {
//     setTitle('');
//     setTotalHours('');
//     setDurationValue('7');
//     setDurationUnit('days');
//     setTotalPoints('');
//   }, [])
// );


//   const handleCreate = async () => {
//     if (!title || !totalHours || !durationValue || !totalPoints) {
//       Alert.alert('Missing fields', 'Please fill in all fields');
//       return;
//     }

//     try {
//       let durationDays = Number(durationValue);
//       if (durationUnit === 'weeks') {
//         durationDays = durationDays * 7;
//       }

//       const res = await axiosInstance.post('/challenges/create', {
//         title,
//         totalHours: Number(totalHours),
//         durationDays,
//         totalPoints: Number(totalPoints),
//         startDate: new Date().toISOString(),
//         hashtags: ['studygram', 'studytips'],
//       });

//       const challengeCode = res.data.challengeCode;

//       Alert.alert(
//         'Challenge Created!',
//         `Challenge Code:\n${challengeCode}\n\nShare this code with friends so they can join.`,
//         [
//           {
//             text: 'Copy Code',
//             onPress: () => {
//               // Clipboard.setString(challengeCode);
//             },
//           },
//           {
//             text: 'OK',
//             onPress: () => navigation.goBack(),
//           },
//         ]
//       );
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to create challenge');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Create Challenge</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Title (e.g., Study Marathon)"
//         placeholderTextColor="#aaa"
//         value={title}
//         onChangeText={setTitle}
//       />

//       <View style={styles.row}>
//         <TextInput
//           style={[styles.input, { flex: 1, marginRight: 10 }]}
//           placeholder="Total Hours (e.g., 20)"
//           placeholderTextColor="#aaa"
//           keyboardType="numeric"
//           value={totalHours}
//           onChangeText={setTotalHours}
//         />
//         <Text style={styles.label}>hours in</Text>
//       </View>

//       <View style={styles.row}>
//         <TextInput
//           style={[styles.input, { flex: 1, marginRight: 10 }]}
//           placeholder="Duration"
//           placeholderTextColor="#aaa"
//           keyboardType="numeric"
//           value={durationValue}
//           onChangeText={setDurationValue}
//         />
//         <View style={[styles.pickerContainer, { flex: 1 }]}>
//           <Picker
//             selectedValue={durationUnit}
//             onValueChange={(itemValue) => setDurationUnit(itemValue)}
//             style={styles.picker}
//             dropdownIconColor="#00ffcc"
//           >
//             <Picker.Item label="days" value="days" />
//             <Picker.Item label="weeks" value="weeks" />
//           </Picker>
//         </View>
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Total Points (e.g., 1000)"
//         placeholderTextColor="#aaa"
//         keyboardType="numeric"
//         value={totalPoints}
//         onChangeText={setTotalPoints}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleCreate}>
//         <Text style={styles.buttonText}>Create Challenge</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0e0e0e',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   header: {
//     fontFamily: 'PressStart2P',
//     fontSize: 12,
//     color: '#00ffcc',
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   input: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     backgroundColor: '#1e1e1e',
//     borderColor: '#333',
//     borderWidth: 1,
//     color: '#fff',
//     padding: 10,
//     marginBottom: 15,
//     borderRadius: 6,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   pickerContainer: {
//     backgroundColor: '#1e1e1e',
//     borderColor: '#333',
//     borderWidth: 1,
//     borderRadius: 6,
//     overflow: 'hidden',
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//     color: '#fff',
//   },
//   label: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#fff',
//     marginLeft: 10,
//     marginRight: 10,
//   },
//   button: {
//     backgroundColor: '#00ffcc',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   buttonText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#0e0e0e',
//     textAlign: 'center',
//   },
//  });
// ✅ Enhanced CreateChallengeScreen with improved UX and default values
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';

export default function CreateChallengeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [durationValue, setDurationValue] = useState('7');
  const [durationUnit, setDurationUnit] = useState('days');
  const [totalPoints, setTotalPoints] = useState('');

  useFocusEffect(
    useCallback(() => {
      setTitle('');
      setTotalHours('');
      setDurationValue('7');
      setDurationUnit('days');
      setTotalPoints('');
    }, [])
  );

  const handleCreate = async () => {
    if (!title || !totalHours || !durationValue || !totalPoints) {
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }

    try {
      let durationDays = Number(durationValue);
      if (durationUnit === 'weeks') durationDays *= 7;

      const res = await axiosInstance.post('/challenges/create', {
        title,
        totalHours: Number(totalHours),
        durationDays,
        totalPoints: Number(totalPoints),
        startDate: new Date().toISOString(),
        hashtags: ['#studygram', '#studytips'],
        description: `A ${durationDays}-day challenge to complete ${totalHours} hours.`,
      });

      const challengeCode = res.data.challengeCode;

      Alert.alert(
        'Challenge Created!',
        `Code: ${challengeCode}\n\nShare with friends to join.`,
        [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create challenge');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Challenge</Text>

      <TextInput
        style={styles.input}
        placeholder="Title (e.g., Study Marathon)"
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="Total Hours (e.g., 20)"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={totalHours}
          onChangeText={setTotalHours}
        />
        <Text style={styles.label}>hours in</Text>
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="Duration"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={durationValue}
          onChangeText={setDurationValue}
        />
        <View style={[styles.pickerContainer, { flex: 1 }]}>
          <Picker
            selectedValue={durationUnit}
            onValueChange={setDurationUnit}
            style={styles.picker}
            dropdownIconColor="#00ffcc"
          >
            <Picker.Item label="days" value="days" />
            <Picker.Item label="weeks" value="weeks" />
          </Picker>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Total Points (e.g., 1000)"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={totalPoints}
        onChangeText={setTotalPoints}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Challenge</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#00ffcc',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    borderWidth: 1,
    color: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#fff',
    marginLeft: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#00ffcc',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#0e0e0e',
    textAlign: 'center',
  },
});
