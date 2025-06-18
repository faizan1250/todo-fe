

// // screens/FriendsScreen.tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
// import axios from '../api/AxiosInstance';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';

// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import { RootStackParamList } from '../navigation/types';

// export default function FriendsScreen() {
//   const { token } = useAuth();
//   const { presenceList } = useSocket();

//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();
//   const [friends, setFriends] = useState<any[]>([]);

//   const fetchFriends = async () => {
//     try {
//       const res = await axios.get('/friends/list', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setFriends(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const removeFriend = async (friendId: string) => {
//     try {
//       await axios.post(
//         '/friends/remove',
//         { friendId },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       fetchFriends(); // Refresh
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchFriends();
//   }, []);

//   // Get current online status for friend from presenceList or fallback to 'Offline'
//   const getStatusForUser = (userId: string) => {
//     const presence = presenceList.find((p) => p.userId === userId);
//     return presence ? presence.status : 'Offline';
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Friends</Text>
//       <FlatList
//         data={friends}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.friendBox}>
   
//              <Text style={styles.friendText}>
//               {item.nickname || item.name} ({item.email})
//              </Text>
//            <Text
//            style={[
//                        styles.statusText,
//                      getStatusForUser(item.id) === 'Offline' && { color: 'red' },
//                 ]}
// >
//   Status: {getStatusForUser(item.id)}
// </Text>
//             <View style={styles.buttonRow}>
//               <Button
//                 title="Nickname"
//                 color="#00ffcc"
//                 onPress={() =>
//                   navigation.navigate('NicknameModal', { friendId: item.id })
//                 }
//               />
//               <Button
//                 title="Remove"
//                 color="#ff3366"
//                 onPress={() =>
//                   Alert.alert('Confirm', `Remove ${item.name}?`, [
//                     { text: 'Cancel' },
//                     { text: 'Remove', onPress: () => removeFriend(item.id) },
//                   ])
//                 }
//               />
//             </View>
//           </View>
//         )}
//       />
//       <View style={{ marginTop: 20 }}>
//         <Button
//           title="Add Friend"
//           color="#00ffcc"
//           onPress={() => navigation.navigate('AddFriend')}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#0e0e0e',
//     flex: 1,
//     padding: 16,
//   },
//   title: {
//     fontFamily: 'PressStart2P',
//     fontSize: 12,
//     color: '#00ffcc',
//     marginBottom: 12,
//   },
//   friendBox: {
//     backgroundColor: '#1a1a1a',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 10,
//   },
//   friendText: {
//     color: '#fff',
//     fontSize: 10,
//     fontFamily: 'PressStart2P',
//     marginBottom: 8,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//    statusText: {
//     color: '#00ffcc',
//      fontSize: 8,
//      fontFamily: 'PressStart2P',
//      marginBottom: 8,
//    },
// });
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';
import axios from '../api/AxiosInstance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

interface Friend {
  id: string;
  name: string;
  email: string;
  nickname: string | null;
  profilePic?: string | null;
}

export default function FriendsScreen() {
  const { token } = useAuth();
  const { presenceList } = useSocket();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);

  const fetchFriends = async () => {
    try {
      const res = await axios.get<Friend[]>('/friends/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data);
    } catch (err) {
      console.error('Fetch Friends Error:', err);
      Alert.alert('Error', 'Failed to fetch friends.');
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await axios.post(
        '/friends/remove',
        { friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriends();
    } catch (err) {
      console.error('Remove Friend Error:', err);
      Alert.alert('Error', 'Failed to remove friend.');
    }
  };

  const getStatusForUser = (userId: string): string => {
    const presence = presenceList.find(p => p.userId === userId);
    return presence ? presence.status : 'Offline';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  const getInitials = (nameOrEmail: string) => {
    const name = nameOrEmail.split(' ')[0] || nameOrEmail;
    return name[0]?.toUpperCase() || '?';
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendBox}>
      <TouchableOpacity
        onPress={() => {
          if (item.profilePic) {
            setModalImageUri(item.profilePic);
            setModalVisible(true);
          }
        }}
      >
        {item.profilePic ? (
          <Image source={{ uri: item.profilePic }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>
              {getInitials(item.nickname || item.name || item.email)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.friendText}>
        {item.nickname || item.name} ({item.email})
      </Text>
      <Text
        style={[
          styles.statusText,
          getStatusForUser(item.id) === 'Offline' && { color: 'red' },
        ]}
      >
        Status: {getStatusForUser(item.id)}
      </Text>
      <View style={styles.buttonRow}>
        <Button
          title="Nickname"
          color="#00ffcc"
          onPress={() => navigation.navigate('NicknameModal', { friendId: item.id })}
        />
        <Button
          title="Remove"
          color="#ff3366"
          onPress={() =>
            Alert.alert('Confirm', `Remove ${item.name}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', onPress: () => removeFriend(item.id) },
            ])
          }
        />
      </View>
    </View>
  );

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
       <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
    <View style={styles.container}>
      <Text style={styles.title}>Your Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ffcc"
          />
        }
      />
      <View style={styles.addButtonWrapper}>
        <Button
          title="Add Friend"
          color="#00ffcc"
          onPress={() => navigation.navigate('AddFriend')}
        />
      </View>

      {/* Fullscreen Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          >
            {modalImageUri && (
              <Image source={{ uri: modalImageUri }} style={styles.modalImage} />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0e0e0e',
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#00ffcc',
    marginBottom: 12,
    textAlign: 'center',
  },
  friendBox: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00ffcc',
    marginBottom: 8,
  },
  placeholderImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#666',
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'PressStart2P',
  },
  friendText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'PressStart2P',
    marginBottom: 6,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    marginBottom: 8,
    color: '#00ffcc',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  addButtonWrapper: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '80%',
    height: '60%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
});
