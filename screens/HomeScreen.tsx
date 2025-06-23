
import React, { useLayoutEffect, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, FlatList, 
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, NavigationProp, useRoute, useFocusEffect } from '@react-navigation/native';
import { RootDrawerParamList, RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axiosInstance from '../api/AxiosInstance';
import FABMenu from '../components/FABMenu';

type StatsData = {
  daily: Record<string, number>;
  weekly: Record<string, number>;
  monthly: Record<string, number>;
};

type LeaderboardEntry = {
  _id?: string;
  name: string;
  points: number;
  currentMonthPoints: number;
  previousMonthPoints?: number;
  totalWins?: number;
  profileColor?: string; // Add if needed
};
type LeaderboardData = {
  currentMonth?: string;
  currentMonthLeaderboard?: LeaderboardEntry[];
  previousMonthLeaderboard?: LeaderboardEntry[];
  previousMonthWinner?: {
    month: string;
    winners: LeaderboardEntry[];
  };
  winSummary?: {
    name: string;
    totalWins: number;
    winHistory: { month: string; points: number }[];
  }[];
};

interface Participant {
  user: string | {
    _id: string;
    name: string;
    profileColor?: string;
  };
  pointsEarned?: number;
}

interface ChallengeItem {
  _id: string;
  title: string;
  status: 'Active' | 'Completed' | 'Upcoming';
  totalHours: number;
  totalPoints: number;
  participants: Participant[];
  createdAt: string;
  myProgress?: {
    formatted: string;
  };
}

export default function HomeScreen() {
  const route = useRoute();
  type CombinedNavigationProp = DrawerNavigationProp<RootDrawerParamList> & NavigationProp<RootStackParamList>;
  const navigation = useNavigation<CombinedNavigationProp>();

  const { user, logout, setUser, token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate points with monthly breakdown
  const calculatePoints = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let currentMonthPoints = 0;
    let previousMonthPoints = 0;
    let allTimePoints = 0;

    challenges.forEach(challenge => {
      const challengeDate = new Date(challenge.createdAt);
      const challengeMonth = challengeDate.getMonth();
      const challengeYear = challengeDate.getFullYear();

      const participant = challenge.participants.find((p: Participant) => {
        const userId = typeof p.user === 'string' ? p.user : p.user._id;
        return userId === user?.id;
      });

      const points = participant?.pointsEarned || 0;
      allTimePoints += points;

      // Current month points
      if (challengeMonth === currentMonth && challengeYear === currentYear) {
        currentMonthPoints += points;
      }
      // Previous month carryover (only for active challenges)
      else if (
        challengeMonth === (currentMonth === 0 ? 11 : currentMonth - 1) &&
        challengeYear === (currentMonth === 0 ? currentYear - 1 : currentYear) &&
        challenge.status === 'Active'
      ) {
        previousMonthPoints += points;
      }
    });

    return {
      currentMonthPoints,
      previousMonthPoints,
      allTimePoints,
      totalPossiblePoints: challenges.reduce((acc, ch) => {
        if (ch.status !== 'Completed') return acc + (ch.totalPoints || 0);
        return acc;
      }, 0)
    };
  }, [challenges, user?.id]);

  const pointsData = useMemo(() => calculatePoints(), [calculatePoints]);

  const activeChallenge = useMemo(() => {
    return challenges.find(ch => ch.status === 'Active');
  }, [challenges]);

  const fetchChallenges = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await axiosInstance.get('/challenges/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError('Failed to fetch challenges');
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/stats/advanced', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  }, [token]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLeaderboardLoading(true);
      const res = await axiosInstance.get('/leaderboard/summary', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          monthlyBreakdown: true
        }
      });
      setLeaderboard(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  }, [token]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchChallenges(),
        fetchStats(),
        fetchLeaderboard()
      ]);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  }, [fetchChallenges, fetchLeaderboard, fetchStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [fetchLeaderboard])
  );

  const formatMonth = useCallback((monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, []);

  useLayoutEffect(() => {
    if (route.name !== 'Home') return;
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

  const pickImageAndUpload = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permissions are required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      quality: 0.7 
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) throw new Error('Selected file does not exist');

        const formData = new FormData();
        formData.append('profilePic', { 
          uri, 
          name: filename, 
          type 
        } as any);

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
  }, [token, user, setUser]);

  const renderChallengeItem = useCallback(({ item }: { item: ChallengeItem }) => {
    const statusColor = item.status === 'Active' ? '#26dbc3' : item.status === 'Completed' ? '#ff66cc' : '#888';
    const progress = item.myProgress?.formatted || '0h 0m';
    if (filter !== 'All' && item.status !== filter) return null;
    return (
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => navigation.navigate('ChallengeDetail', { challengeId: item._id })}
      >
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={[styles.challengeStatus, { color: statusColor }]}> 
          {item.status} — {progress} / {item.totalHours}h
        </Text>
      </TouchableOpacity>
    );
  }, [filter, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(['All', 'Active', 'Completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[styles.tab, filter === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Today: {Math.floor((stats.daily[Object.keys(stats.daily).pop()!] || 0) / 3600)}h
          </Text>
          <Text style={styles.statsText}>
            Week: {(Object.values(stats.weekly).reduce((a, b) => a + b, 0) / 3600 | 0)}h
          </Text>
          <Text style={styles.statsText}>
            Month: {(Object.values(stats.monthly).reduce((a, b) => a + b, 0) / 3600 | 0)}h
          </Text>
        </View>
      )}

    <View style={styles.pointsContainer}>
  <Text style={[styles.pointsText, styles.currentMonthPoints]}>
    This Month: {pointsData.currentMonthPoints} pts
  </Text>
  {pointsData.previousMonthPoints > 0 && (
    <Text style={[styles.pointsText, styles.carryoverPoints]}>
      Carryover: {pointsData.previousMonthPoints} pts
    </Text>
  )}
  <Text style={styles.pointsText}>
    Available: {pointsData.totalPossiblePoints} pts
  </Text>
  {lastUpdated && (
    <Text style={styles.updateText}>
      Updated: {lastUpdated.toLocaleTimeString()}
    </Text>
  )}
</View>

      {leaderboardLoading ? (
        <ActivityIndicator size="small" color="#26dbc3" />
      ) : (
        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>Current Leaderboard</Text>
          
       {leaderboard?.currentMonthLeaderboard && leaderboard.currentMonthLeaderboard.length > 0 ? (
  <>
    <Text style={styles.subtitle}>
      {leaderboard.currentMonth ? formatMonth(leaderboard.currentMonth) : 'Current month'}
    </Text>
    {leaderboard.currentMonthLeaderboard.slice(0, 3).map((user, index) => (
      <View key={user._id || index} style={styles.leaderboardRow}>
        <Text style={styles.leaderboardRank}>{index + 1}.</Text>
        <Text style={styles.leaderboardName}>{user.name}</Text>
        <View style={styles.leaderboardPointsContainer}>
          <Text style={styles.leaderboardPoints}>{user.currentMonthPoints} pts</Text>
          {user.previousMonthPoints && user.previousMonthPoints > 0 && (
            <Text style={styles.leaderboardCarryoverPoints}>+{user.previousMonthPoints}</Text>
          )}
        </View>
      </View>
    ))}
  </>
) : (
  <View style={styles.leaderboardEmpty}>
    <Ionicons name="trophy-outline" size={24} color="#666" />
    <Text style={styles.leaderboardEmptyText}>No leaderboard data yet</Text>
    <Text style={styles.leaderboardEmptySubtext}>Complete challenges to appear on the leaderboard</Text>
  </View>
)}
        </View>
      )}

      {activeChallenge && (
        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>{activeChallenge.title}</Text>
          <Text style={styles.highlightProgress}>
            {activeChallenge.myProgress?.formatted || '0h 0m'} / {activeChallenge.totalHours}h
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ChallengeDetail', { challengeId: activeChallenge._id })}
          >
            <Text style={styles.highlightButton}>Go to Challenge</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#26dbc3" />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item._id}
          renderItem={renderChallengeItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchAllData} 
              colors={["#26dbc3"]} 
            />
          }
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
            <TouchableOpacity 
              style={styles.popupButton} 
              onPress={pickImageAndUpload} 
              disabled={uploading}
            >
              <Text style={styles.popupButtonText}>
                {uploading ? 'Uploading...' : 'Edit Profile Picture'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.popupButton} 
              onPress={() => { setShowProfilePopup(false); navigation.navigate('Friends'); }}
            >
              <Text style={styles.popupButtonText}>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.popupButton} 
              onPress={() => { logout(); setShowProfilePopup(false); }}
            >
              <Text style={styles.popupButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setShowProfilePopup(false)}>
              <Text style={styles.popupCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FABMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  tabContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 12, 
    marginBottom: 8 
  },
  tab: { 
    paddingVertical: 6, 
    paddingHorizontal: 14, 
    marginHorizontal: 4, 
    borderRadius: 20, 
    backgroundColor: '#1a1a1a' 
  },
  tabActive: { backgroundColor: '#26dbc3' },
  tabText: { fontSize: 12, color: '#aaa' },
  tabTextActive: { color: '#0e0e0e', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#888' },
  challengeCard: { 
    backgroundColor: '#1a1a1a', 
    marginHorizontal: 16, 
    marginVertical: 6, 
    padding: 14, 
    borderRadius: 8 
  },
  challengeTitle: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  challengeStatus: { fontSize: 12 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#26dbc3',
    fontWeight: '600',
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  currentMonthPoints: {
    color: '#26dbc3',
  },
  carryoverPoints: {
    color: '#ffa500',
    fontSize: 12,
  },
  updateText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  highlightCard: {
    backgroundColor: '#222',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 8,
    borderColor: '#26dbc3',
    borderWidth: 1
  },
  highlightTitle: {
    color: '#26dbc3',
    fontSize: 15,
    fontWeight: '700'
  },
  highlightProgress: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12
  },
  highlightButton: {
    color: '#26dbc3',
    marginTop: 10,
    fontWeight: '600',
    fontSize: 13
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  popup: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center'
  },
  popupPic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12
  },
  popupText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 6
  },
  popupButton: {
    backgroundColor: '#26dbc3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 10
  },
  popupButtonText: {
    color: '#0e0e0e',
    fontWeight: '600'
  },
  popupCloseText: {
    color: '#aaa',
    fontSize: 10
  },
  leaderboardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#26dbc3',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leaderboardRank: {
    color: '#fff',
    width: 24,
    fontWeight: 'bold',
  },
  leaderboardName: {
    color: '#fff',
    flex: 1,
    marginLeft: 8,
  },
  leaderboardPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardPoints: {
    color: '#26dbc3',
    fontWeight: '600',
  },
  leaderboardCarryoverPoints: {
    color: '#ffa500',
    fontSize: 10,
    marginLeft: 4,
  },
  leaderboardEmpty: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  leaderboardEmptyText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  leaderboardEmptySubtext: {
    color: '#444',
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
  },
});