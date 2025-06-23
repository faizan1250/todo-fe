
// LeaderboardScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { AxiosError } from 'axios';

const generateMonthList = () => {
  const months: string[] = [];
  const now = new Date();
  const year = now.getFullYear();

  for (let m = now.getMonth(); m >= 0; m--) {
    const month = String(m + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }

  return months;
};

export default function LeaderboardScreen() {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<'live' | 'saved'>('live');
  const [viewType, setViewType] = useState<'shared' | 'all'>('shared');
  const monthList = useMemo(() => generateMonthList(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthList[0]);
  const [savedData, setSavedData] = useState<any>([]);
  const [winHistory, setWinHistory] = useState<any[]>([]);
  const [winHistoryLoaded, setWinHistoryLoaded] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

//   const fetchLeaderboard = async () => {
//     try {
//       setLoading(true);
//       const endpoint = viewType === 'shared' 
//         ? '/leaderboard/shared-summary' 
//         : '/leaderboard/summary';
//       const res = await axiosInstance.get(endpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setData(res.data);
//     } catch (err) {
//       console.error('Failed to load leaderboard:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const fetchMonthly = async (month: string) => {
//     try {
//       setLoading(true);
//       const endpoint = viewType === 'shared'
//         ? `/leaderboard/monthly/${month}/shared`
//         : `/leaderboard/monthly/${month}`;
//       const res = await axiosInstance.get(endpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSavedData(res.data);
//     } catch (err) {
//       console.error('Failed to load saved leaderboard:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
// Update the fetchMonthly function in LeaderboardScreen.tsx
const fetchLeaderboard = async () => {
  try {
    setLoading(true);
    const endpoint = viewType === 'shared' 
      ? '/leaderboard/shared-summary' 
      : '/leaderboard/summary';
    const res = await axiosInstance.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Normalize the data structure for both summary and shared-summary endpoints
    const normalizedData = res.data.leaderboard 
      ? { currentMonthLeaderboard: res.data.leaderboard }
      : res.data;

    setData(normalizedData);
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

const fetchMonthly = async (month: string) => {
  try {
    setLoading(true);
    let endpoint;
    
    if (viewType === 'shared') {
      // First try the new endpoint format
      try {
        endpoint = `/leaderboard/monthly/${month}/shared`;
        const res = await axiosInstance.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedData(res.data);
        return;
      } catch (err) {
        const sharedErr = err as AxiosError; // Type assertion
        if (sharedErr.response?.status === 404) {
          // Fallback to filtering client-side if endpoint doesn't exist
          endpoint = `/leaderboard/monthly/${month}`;
          const res = await axiosInstance.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Filter for shared challenges client-side
          const sharedData = res.data.filter((entry: any) => 
            entry.challenge?.participants?.length >= 2
          );
          setSavedData(sharedData);
        } else {
          throw sharedErr;
        }
      }
    } else {
      endpoint = `/leaderboard/monthly/${month}`;
      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedData(res.data);
    }
  } catch (err) {
    console.error('Failed to load saved leaderboard:', err);
    setSavedData([]); // Set empty array to prevent rendering errors
  } finally {
    setLoading(false);
  }
};

const fetchWinHistory = async () => {
    try {
      const res = await axiosInstance.get('/leaderboard/win-history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWinHistory(res.data);
    } catch (err) {
      console.error('Win history fetch error:', err);
      setWinHistory([]);
    } finally {
      setWinHistoryLoaded(true);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchMonthly(selectedMonth);
    fetchWinHistory();
  }, [viewType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (mode === 'live') fetchLeaderboard();
    else fetchMonthly(selectedMonth);
  }, [mode, selectedMonth, viewType]);

//   const renderTopUsers = (list: any[]) => {
//     if (!list || list.length === 0) return null;
//     return list.map((entry, index) => (
//       <View
//         key={entry._id || index}
//         style={[
//           styles.topUserRow,
//           entry._id === user?.id ? styles.highlightRow : null,
//         ]}
//       >
//         <Text style={styles.rank}>{index + 1}</Text>
//         <View>
//           <Text style={styles.name}>{entry.name}</Text>
//           {entry.carryoverPoints !== undefined && (
//             <Text style={styles.carryoverLabel}>
//               Carryover: {Math.floor(entry.carryoverPoints || entry.previousMonthPoints || 0)} pts
//             </Text>
//           )}
//         </View>
//         <Text style={styles.points}>
//           {Math.floor(entry.points || entry.currentMonthPoints + (entry.carryoverPoints || entry.previousMonthPoints || 0))} pts
//         </Text>
//       </View>
//     ));
//   };
// Update the renderTopUsers function to handle points consistently
const renderTopUsers = (list: any[]) => {
  if (!list || list.length === 0) return null;
  
  return list.map((entry, index) => {
    // Calculate points consistently for both live and saved views
    const points = entry.points !== undefined 
      ? entry.points 
      : (entry.currentMonthPoints || 0) + (entry.carryoverPoints || entry.previousMonthPoints || 0);
      
    const carryoverPoints = entry.carryoverPoints !== undefined
      ? entry.carryoverPoints
      : entry.previousMonthPoints || 0;

    return (
      <View
        key={entry._id || index}
        style={[
          styles.topUserRow,
          entry._id === user?.id ? styles.highlightRow : null,
        ]}
      >
        <Text style={styles.rank}>{index + 1}</Text>
        <View>
          <Text style={styles.name}>{entry.name}</Text>
          {carryoverPoints > 0 && (
            <Text style={styles.carryoverLabel}>
              Carryover: {Math.floor(carryoverPoints)} pts
            </Text>
          )}
        </View>
        <Text style={styles.points}>
          {Math.floor(points)} pts
        </Text>
      </View>
    );
  });
};

  const renderWinHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏅 Hall of Fame</Text>
      {winHistory.length > 0 ? (
        winHistory.map((entry: any) => (
          <View key={entry._id} style={styles.winnerRow}>
            <Text style={styles.name}>{entry.name}</Text>
            <Text style={styles.subtitle}>🏆 {entry.totalWins} wins</Text>
          </View>
        ))
      ) : winHistoryLoaded ? (
        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <Ionicons name="information-circle-outline" size={22} color="#888" />
          <Text style={styles.subtitle}>No Hall of Fame data yet</Text>
          <View style={styles.winnerRow}>
            <Text style={[styles.name, { color: '#444' }]}>GrandDaddy</Text>
            <Text style={[styles.subtitle, { color: '#444' }]}>🏆 6 wins</Text>
          </View>
          <View style={styles.winnerRow}>
            <Text style={[styles.name, { color: '#444' }]}>Daddy</Text>
            <Text style={[styles.subtitle, { color: '#444' }]}>🏆 5 wins</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00ffcc"]} />}
    >
      <Text style={styles.header}>📊 Leaderboard</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          onPress={() => setViewType('shared')} 
          style={[styles.toggle, viewType === 'shared' && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>Shared</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setViewType('all')} 
          style={[styles.toggle, viewType === 'all' && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          onPress={() => setMode('live')} 
          style={[styles.toggle, mode === 'live' && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setMode('saved')} 
          style={[styles.toggle, mode === 'saved' && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>Saved</Text>
        </TouchableOpacity>
      </View>

      {mode === 'saved' && (
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setMonthPickerVisible(true)}
        >
          <Text style={styles.monthSelectorText}>📅 {selectedMonth}</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={monthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(value) => {
                setSelectedMonth(value);
                setMonthPickerVisible(false);
                fetchMonthly(value);
              }}
              style={{ color: '#00ffcc', backgroundColor: '#1a1a1a' }}
              dropdownIconColor="#00ffcc"
            >
              {monthList.map((month) => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#00ffcc" />
      ) : (
        <>
          {/* {mode === 'live'
            ? renderTopUsers(data?.currentMonthLeaderboard || data?.leaderboard || [])
            : savedData.length > 0
            ? renderTopUsers(savedData)
            : (
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                  <Ionicons name="information-circle-outline" size={24} color="#666" />
                  <Text style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
                    No saved leaderboard data available for {selectedMonth}.
                  </Text>
                  <Text style={{ color: '#555', fontSize: 12 }}>
                    Try Live View or check again after completing challenges this month.
                  </Text>
                </View>
              )
          } */}
          {mode === 'live'
  ? renderTopUsers(data?.currentMonthLeaderboard || data?.leaderboard || [])
  : savedData.length > 0
  ? renderTopUsers(savedData)
  : (
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Ionicons name="information-circle-outline" size={24} color="#666" />
        <Text style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
          {viewType === 'shared'
            ? `No shared leaderboard data available for ${selectedMonth}.`
            : `No leaderboard data available for ${selectedMonth}.`
          }
        </Text>
        <Text style={{ color: '#555', fontSize: 12 }}>
          Try Live View or check again after completing challenges this month.
        </Text>
      </View>
    )
}
        </>
      )}

      {renderWinHistory()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e', padding: 16 },
  header: { fontSize: 18, fontWeight: '700', color: '#00ffcc', textAlign: 'center', marginBottom: 16 },
  topUserRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1a1a', padding: 12, borderRadius: 6, marginBottom: 8 },
  winnerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rank: { color: '#ffd700', fontWeight: 'bold', fontSize: 16 },
  name: { color: '#fff', fontSize: 14 },
  carryoverLabel: { color: '#888', fontSize: 11, fontStyle: 'italic' },
  points: { color: '#00ffcc', fontWeight: '700', fontSize: 14 },
  subtitle: { color: '#aaa', fontSize: 12 },
  section: { marginTop: 24, paddingTop: 10, borderTopColor: '#333', borderTopWidth: 1 },
  sectionTitle: { color: '#00ffcc', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  toggle: { paddingVertical: 6, paddingHorizontal: 16, marginHorizontal: 6, backgroundColor: '#222', borderRadius: 20 },
  toggleActive: { backgroundColor: '#00ffcc' },
  toggleText: { fontSize: 12, color: '#fff' },
  highlightRow: { backgroundColor: '#004d40' },
  monthSelector: { alignSelf: 'center', backgroundColor: '#1f1f1f', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginBottom: 10 },
  monthSelectorText: { color: '#00ffcc', fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#121212', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { color: '#00ffcc', fontSize: 14, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
});
