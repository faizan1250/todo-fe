

// import React, { useEffect, useState } from 'react';
// import axios, { isAxiosError } from 'axios';

// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Modal,
//   TextInput,
//   Alert,
//   RefreshControl,
// } from 'react-native';
// import axiosInstance from '../api/AxiosInstance';
// import { useAuth } from '../context/AuthContext';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/types';

// type ChallengeListScreenNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'ChallengeList'
// >;

// export default function ChallengeListScreen() {
//   const [challenges, setChallenges] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [joinModalVisible, setJoinModalVisible] = useState(false);
//   const [joinId, setJoinId] = useState('');

//   const navigation = useNavigation<ChallengeListScreenNavigationProp>();
//   const { token } = useAuth();

//   const fetchChallenges = async () => {
//     try {
//       setRefreshing(true);
//       const res = await axiosInstance.get('/challenges/my', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setChallenges(res.data);
//     } catch (err) {
//       console.error('Failed to load challenges:', err);
//     } finally {
//       setRefreshing(false);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChallenges();
//   }, [token]);

//   const joinChallenge = async () => {
//     try {
//       await axiosInstance.post(
//         '/challenges/join',
//         { challengeCode: joinId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       Alert.alert('Success', 'You joined the challenge!');
//       setJoinModalVisible(false);
//       setJoinId('');

//       // Refresh challenge list after joining
//       fetchChallenges();
//     } catch (err) {
//       console.error(err);

//       let errorMessage = 'Could not join challenge';

//       if (isAxiosError(err) && err.response?.data?.msg) {
//         errorMessage = err.response.data.msg;
//       }

//       Alert.alert('Error', errorMessage);
//     }
//   };

//   const renderItem = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={styles.challengeCard}
//       onPress={() => navigation.navigate('ChallengeDetail', { challengeId: item._id })}
//     >
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.status}>Status: {item.status}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={styles.createButton}
//         onPress={() => navigation.navigate('CreateChallenge')}
//       >
//         <Text style={styles.createText}>+ Create Challenge</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.joinButton}
//         onPress={() => setJoinModalVisible(true)}
//       >
//         <Text style={styles.joinText}>🔗 Join by ID</Text>
//       </TouchableOpacity>

//       {loading && !refreshing ? (
//         <ActivityIndicator size="large" color="#00ffcc" />
//       ) : (
//         <FlatList
//           data={challenges}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={fetchChallenges}
//               colors={['#00ffcc']}
//             />
//           }
//         />
//       )}

//       {/* Join Challenge Modal */}
//       <Modal visible={joinModalVisible} transparent animationType="slide">
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Enter Challenge ID</Text>
//             <TextInput
//               value={joinId}
//               onChangeText={setJoinId}
//               placeholder="e.g. 64b123abc..."
//               placeholderTextColor="#999"
//               style={styles.input}
//             />
//             <TouchableOpacity style={styles.modalButton} onPress={joinChallenge}>
//               <Text style={styles.modalButtonText}>Join</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.modalButton, { backgroundColor: '#666' }]}
//               onPress={() => setJoinModalVisible(false)}
//             >
//               <Text style={styles.modalButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0e0e0e', padding: 16 },

//   challengeCard: {
//     backgroundColor: '#1a1a1a',
//     padding: 16,
//     marginVertical: 8,
//     borderRadius: 8,
//   },
//   title: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#00ffcc',
//   },
//   status: {
//     fontFamily: 'PressStart2P',
//     fontSize: 8,
//     color: '#ccc',
//     marginTop: 4,
//   },

//   createButton: {
//     backgroundColor: '#00ffcc',
//     padding: 10,
//     borderRadius: 6,
//     marginBottom: 8,
//   },
//   createText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#0e0e0e',
//     textAlign: 'center',
//   },

//   joinButton: {
//     backgroundColor: '#ff00cc',
//     padding: 10,
//     borderRadius: 6,
//     marginBottom: 12,
//   },
//   joinText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#fff',
//     textAlign: 'center',
//   },

//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#1e1e1e',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   modalTitle: {
//     color: '#fff',
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   input: {
//     backgroundColor: '#333',
//     color: '#fff',
//     padding: 10,
//     borderRadius: 6,
//     marginBottom: 12,
//     fontSize: 12,
//   },
//   modalButton: {
//     backgroundColor: '#00ffcc',
//     padding: 10,
//     borderRadius: 6,
//     marginBottom: 10,
//   },
//   modalButtonText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#0e0e0e',
//     textAlign: 'center',
//   },
// // });
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { isAxiosError } from 'axios';

type ChallengeListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeList'
>;

export default function ChallengeListScreen() {
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinId, setJoinId] = useState('');

  const navigation = useNavigation<ChallengeListScreenNavigationProp>();
  const { token } = useAuth();

  const joinChallenge = async () => {
    try {
      await axiosInstance.post(
        '/challenges/join',
        { challengeCode: joinId.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'You joined the challenge!');
      setJoinModalVisible(false);
      setJoinId('');
      navigation.goBack(); // Return to home screen which will show the new challenge
    } catch (err) {
      console.error(err);
      let errorMessage = 'Could not join challenge';
      if (isAxiosError(err) && err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenge Actions</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateChallenge')}
      >
        <Text style={styles.buttonText}>+ Create Challenge</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => setJoinModalVisible(true)}
      >
        <Text style={styles.buttonText}>🔗 Join by Code</Text>
      </TouchableOpacity>

      {/* Join Modal */}
      <Modal visible={joinModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Challenge Code</Text>
            <TextInput
              value={joinId}
              onChangeText={setJoinId}
              placeholder="e.g. 82B754"
              placeholderTextColor="#999"
              style={styles.input}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity style={styles.modalButton} onPress={joinChallenge}>
              <Text style={styles.modalButtonText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#666' }]}
              onPress={() => setJoinModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0e0e0e', 
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#00ffcc',
    marginBottom: 24
  },
  createButton: {
    backgroundColor: '#00ffcc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%'
  },
  joinButton: {
    backgroundColor: '#ff00cc',
    padding: 16,
    borderRadius: 8,
    width: '80%'
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#0e0e0e',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 12,
  },
  modalButton: {
    backgroundColor: '#00ffcc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  modalButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#0e0e0e',
    textAlign: 'center',
  },
});