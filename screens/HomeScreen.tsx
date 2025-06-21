
// Enhanced HomeScreen with tabbed filters, animation-ready layout, and floating action button
import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, Animated
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import { RootDrawerParamList, RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/AxiosInstance';
import FABMenu from '../components/FABMenu'; // adjust path if needed


export default function HomeScreen() {
  const route = useRoute();
  type CombinedNavigationProp = DrawerNavigationProp<RootDrawerParamList> & NavigationProp<RootStackParamList>;
  const navigation = useNavigation<CombinedNavigationProp>();

  const { user, logout, setUser, token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [fabOpen, setFabOpen] = useState(false);

interface Participant {
  user: string | {
    _id: string;
    name: string;
    profileColor?: string;
  };
  pointsEarned?: number;
}

const totalEarnedPoints = challenges.reduce((acc, ch) => {
  const participant = ch.participants.find((p: any) => {
    const userId = typeof p.user === 'string' ? p.user : p.user._id;
    return userId === user?.id;
  });
  return acc + (participant?.pointsEarned || 0);
}, 0);

const totalPossiblePoints = challenges.reduce(
  (acc, ch) => acc + (ch.totalPoints || 0),
  0
);


  const fetchChallenges = async () => {
    try {
      setRefreshing(true);
      const res = await axiosInstance.get('/challenges/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(res.data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      Alert.alert('Error', 'Failed to fetch your challenges.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [token]);

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: () => (
  //       <Text style={{ fontSize: 16, fontWeight: '700', color: '#26dbc3' }}>Timero</Text>
  //     ),
  //     headerLeft: () => (
  //       <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingHorizontal: 16 }}>
  //         <Ionicons name="menu" size={24} color="#26dbc3" />
  //       </TouchableOpacity>
  //     ),
  //     headerRight: () => (
  //       <TouchableOpacity onPress={() => setShowProfilePopup(true)} style={{ paddingHorizontal: 16 }}>
  //         {user?.profilePicUrl ? (
  //           <Image source={{ uri: user.profilePicUrl }} style={styles.avatar} />
  //         ) : (
  //           <Ionicons name="person-circle-outline" size={28} color="#26dbc3" />
  //         )}
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, [navigation, user]);


useLayoutEffect(() => {
  if (route.name !== 'Home') return; // ✅ only apply on Home screen inside MainDrawer

  navigation.setOptions({
    headerTitle: () => (
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#26dbc3' }}>Timero</Text>
    ),
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingHorizontal: 16 }}>
        <Ionicons name="menu" size={24} color="#26dbc3" />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={() => setShowProfilePopup(true)} style={{ paddingHorizontal: 16 }}>
        {user?.profilePicUrl ? (
          <Image source={{ uri: user.profilePicUrl }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={28} color="#26dbc3" />
        )}
      </TouchableOpacity>
    ),
  });
}, [navigation, route.name, user]);
  const pickImageAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permissions are required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });

    if (!result.canceled) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) throw new Error('Selected file does not exist');

        const formData = new FormData();
        formData.append('profilePic', { uri, name: filename, type } as any);

        const res = await fetch('https://todo-backend-kfpi.onrender.com/api/users/upload-profile-pic', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
        const json = await res.json();
        const uploadedPicUrl = json?.user?.profilePic;

        if (uploadedPicUrl && user) {
          setUser({ ...user, profilePicUrl: uploadedPicUrl });
          Alert.alert('Success', 'Profile picture updated!');
        }
      } catch (err: any) {
        Alert.alert('Upload Error', err.message || 'Something went wrong.');
      } finally {
        setUploading(false);
      }
    }
  };

  const renderChallengeItem = ({ item }: { item: any }) => {
    const statusColor = item.status === 'Active' ? '#26dbc3' : item.status === 'Completed' ? '#ff66cc' : '#888';
    const progress = item.myProgress?.formatted || '0h 0m';
    if (filter !== 'All' && item.status !== filter) return null;
    return (
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => navigation.navigate('ChallengeDetail', { challengeId: item._id })}
      >
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={[styles.challengeStatus, { color: statusColor }]}> {item.status} — {progress} / {item.totalHours}h</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {['All', 'Active', 'Completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab as any)}
            style={[styles.tab, filter === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {challenges.length > 0 && (
  <Text style={styles.pointsText}>
    Points: {totalEarnedPoints} / {totalPossiblePoints}
  </Text>
)}


      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#26dbc3" />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item._id}
          renderItem={renderChallengeItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchChallenges} colors={["#26dbc3"]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No {filter.toLowerCase()} challenges.</Text>
            </View>
          }
        />
      )}

     

      {showProfilePopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.popup}>
            {user?.profilePicUrl && <Image source={{ uri: user.profilePicUrl }} style={styles.popupPic} />}
            <Text style={styles.popupText}>{user?.nickname || user?.name}</Text>
            <Text style={styles.popupText}>{user?.email}</Text>
            <TouchableOpacity style={styles.popupButton} onPress={pickImageAndUpload} disabled={uploading}>
              <Text style={styles.popupButtonText}>{uploading ? 'Uploading...' : 'Edit Profile Picture'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupButton} onPress={() => { setShowProfilePopup(false); navigation.navigate('Friends'); }}>
              <Text style={styles.popupButtonText}>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupButton} onPress={() => { logout(); setShowProfilePopup(false); }}>
              <Text style={styles.popupButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setShowProfilePopup(false)}>
              <Text style={styles.popupCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
   
{/* Floating Actions */}
{/* <View style={styles.fabContainer}>
  {fabOpen && (
    <>
      <TouchableOpacity
        style={styles.fabOption}
        onPress={() => {
          setFabOpen(false);
          navigation.navigate('CreateChallenge');
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#0e0e0e" />
        <Text style={styles.fabOptionText}>New Challenge</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabOption}
        onPress={() => {
          setFabOpen(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'TodoModule' }],
          });
        }}
      >
        <Ionicons name="checkbox-outline" size={20} color="#0e0e0e" />
        <Text style={styles.fabOptionText}>Todos</Text>
      </TouchableOpacity>
    </>
  )}

  <TouchableOpacity
    style={styles.fabMain}
    onPress={() => setFabOpen((prev) => !prev)}
  >
    <Ionicons name={fabOpen ? 'close' : 'add'} size={28} color="#0e0e0e" />
  </TouchableOpacity>
</View> */}
   <FABMenu />



    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, marginBottom: 8 },
  tab: { paddingVertical: 6, paddingHorizontal: 14, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#1a1a1a' },
  tabActive: { backgroundColor: '#26dbc3' },
  tabText: { fontSize: 12, color: '#aaa' },
  tabTextActive: { color: '#0e0e0e', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#888' },
  challengeCard: { backgroundColor: '#1a1a1a', marginHorizontal: 16, marginVertical: 6, padding: 14, borderRadius: 8 },
  challengeTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  challengeStatus: { fontSize: 12 },
 fabContainer: {
  position: 'absolute',
  bottom: 30,
  right: 20,
  alignItems: 'flex-end',
},

fabMain: {
  backgroundColor: '#26dbc3',
  padding: 16,
  borderRadius: 30,
  elevation: 6,
  justifyContent: 'center',
  alignItems: 'center',
},

fabOption: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#26dbc3',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 20,
  marginBottom: 10,
  elevation: 5,
},

fabOptionText: {
  color: '#0e0e0e',
  fontWeight: '600',
  marginLeft: 8,
  fontSize: 12,
},


  popupOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  popup: { backgroundColor: '#1a1a1a', padding: 24, borderRadius: 12, width: '80%', alignItems: 'center' },
  popupPic: { width: 70, height: 70, borderRadius: 35, marginBottom: 12 },
  popupText: { color: '#fff', fontSize: 12, marginBottom: 6 },
  popupButton: { backgroundColor: '#26dbc3', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, marginTop: 10 },
  popupButtonText: { color: '#0e0e0e', fontWeight: '600' },
  popupCloseText: { color: '#aaa', fontSize: 10 },
  pointsText: {
  textAlign: 'center',
  fontSize: 13,
  color: '#26dbc3',
  marginBottom: 10,
  fontWeight: '600',
},



});

