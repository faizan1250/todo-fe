// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
//   Modal,
// } from 'react-native';
// import axios from 'axios';
// import { API_BASE } from '../../api/Todoapi';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { useAuth } from '../../context/AuthContext'; // example path
// import { Picker } from '@react-native-picker/picker';


// const MODES = ['live', 'month', 'hall'];

// const LeaderboardScreen = () => {
    
// const { token } = useAuth(); // or however you store the token
//   const [mode, setMode] = useState<'live' | 'month' | 'hall'>('live');
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState<any[]>([]);
//  // const [month, setMonth] = useState(new Date().getMonth() + 1); // current month
//   const [monthPickerVisible, setMonthPickerVisible] = useState(false);

// const monthList = Array.from({ length: 12 }, (_, i) =>
//   new Date(0, i).toLocaleString('default', { month: 'long' })
// );

// const [selectedMonth, setSelectedMonth] = useState(
//   monthList[new Date().getMonth()]
// );

// // Optional: internally store numeric month (1–12)
// const [month, setMonth] = useState(new Date().getMonth() + 1);


//   const fetchLeaderboard = async () => {
//     try {
//       setLoading(true);
//       const url = `${API_BASE}/shared/leaderboard?mode=${mode}${
//         mode === 'month' ? `&month=${month}` : ''
//       }`;
//     const res = await axios.get(url, {
//   headers: {
//     Authorization: `Bearer ${token}`
//   }
// });
//       if (mode === 'hall') {
//         setData(res.data.hallOfFame || []);
//       } else {
//         setData(res.data.leaderboard || []);
//       }
//     } catch (err) {
//       console.error('Leaderboard fetch failed', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaderboard();
//   }, [mode, month]);
//   useEffect(() => {
//   if (mode === 'month') {
//     fetchLeaderboard(); // already uses `month` in query param
//   }
// }, [month, mode]);


//   const renderItem = ({ item, index }: any) => (
//     <View style={styles.item}>
//       <Text style={styles.rank}>{index + 1}.</Text>
//       <Text style={styles.name}>{item.name}</Text>
//       <Text style={styles.points}>
//         {mode === 'hall' ? `${item.wins} wins` : `${item.totalPoints} pts`}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>🏆 Leaderboard</Text>

//       <View style={styles.tabRow}>
//         {MODES.map(m => (
//           <TouchableOpacity
//             key={m}
//             style={[styles.modeButton, mode === m && styles.activeMode]}
//             onPress={() => setMode(m as any)}
//           >
//           <Text
//   style={[
//     styles.modeText,
//     mode === m && styles.activeTabText   // ← add this
//   ]}
// >
//               {m === 'live' ? 'Live' : m === 'month' ? 'Monthly' : 'Hall of Fame'}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//      {mode === 'month' && (
//   <>
//     <TouchableOpacity
//       style={styles.monthSelector}
//       onPress={() => setMonthPickerVisible(true)}
//     >
//       <Text style={styles.monthSelectorText}>📅 {selectedMonth}</Text>
//     </TouchableOpacity>

//     <Modal
//       visible={monthPickerVisible}
//       transparent
//       animationType="fade"
//       onRequestClose={() => setMonthPickerVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Select Month</Text>
//           <Picker
//             selectedValue={selectedMonth}
//             onValueChange={(value, index) => {
//               setSelectedMonth(value);
//               setMonth(index + 1); // set month (1–12)
//               setMonthPickerVisible(false);
//             }}
//             style={{ color: '#00ffcc', backgroundColor: '#1a1a1a' }}
//             dropdownIconColor="#00ffcc"
//           >
//             {monthList.map((month) => (
//               <Picker.Item key={month} label={month} value={month} />
//             ))}
//           </Picker>
//         </View>
//       </View>
//     </Modal>
//   </>
// )}

      
 

//       {loading ? (
//         <ActivityIndicator size="large" color="#26dbc3" style={{ marginTop: 30 }} />
//       ) : data.length === 0 ? (
//         <Text style={styles.emptyText}>No data available yet</Text>
//       ) : (
//         <FlatList
//           data={data}
//           keyExtractor={(item, index) => item.userId + index}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 40 }}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   tabRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     backgroundColor: '#000',
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//     paddingVertical: 10,
//   },
//   modeButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//   },
//   modeText: {
//     color: '#888',
//     fontSize: 14,
//   },
//   activeMode: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#26dbc3',
//   },
//   activeTabText: {
//     color: '#26dbc3',
//     fontWeight: 'bold',
//   },
//   monthControl: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 8,
//     gap: 10,
//   },
//   monthLabel: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginHorizontal: 8,
//   },
//   item: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#111',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#222',
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   rank: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#aaa',
//     width: 30,
//   },
//   name: {
//     fontSize: 16,
//     color: '#fff',
//     flex: 1,
//   },
//   points: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#26dbc3',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 40,
//     fontSize: 14,
//     color: '#666',
//   },
//   monthSelector: {
//   backgroundColor: '#1a1a1a',
//   paddingVertical: 10,
//   paddingHorizontal: 16,
//   borderRadius: 8,
//   alignItems: 'center',
//   marginBottom: 10,
//   borderWidth: 1,
//   borderColor: '#333',
// },
// monthSelectorText: {
//   color: '#00ffcc',
//   fontSize: 14,
//   fontWeight: 'bold',
// },
// modalOverlay: {
//   flex: 1,
//   justifyContent: 'center',
//   alignItems: 'center',
//   backgroundColor: 'rgba(0,0,0,0.6)',
// },
// modalContent: {
//   width: '80%',
//   backgroundColor: '#000',
//   borderRadius: 10,
//   padding: 20,
//   borderWidth: 1,
//   borderColor: '#333',
// },
// modalTitle: {
//   fontSize: 16,
//   fontWeight: 'bold',
//   color: '#fff',
//   marginBottom: 10,
//   textAlign: 'center',
// },

// });


// export default LeaderboardScreen;

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

import { API_BASE } from '../../api/Todoapi';
import { useAuth } from '../../context/AuthContext';

type Mode = 'live' | 'month' | 'hall';
const MODES: Mode[] = ['live', 'month', 'hall'];

const monthList = Array.from({ length: 12 }, (_, i) => ({
  name: new Date(0, i).toLocaleString('default', { month: 'long' }),
  value: i + 1 // 1-12
}));

export default function LeaderboardScreen() {
  const { token } = useAuth();
  const [mode, setMode] = useState<Mode>('live');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    monthList[new Date().getMonth()]
  );
  const [pickerVisible, setPickerVisible] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/shared/leaderboard?mode=${mode}`;
      
      if (mode === 'month') {
        url += `&month=${selectedMonth.value}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(
        mode === 'hall' 
          ? res.data.hallOfFame ?? [] 
          : res.data.leaderboard ?? []
      );
    } catch (err) {
      console.error('Leaderboard fetch failed', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [mode, selectedMonth.value, token]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const changeMode = (m: Mode) => {
    setMode(m);
    // Reset to current month when switching to monthly mode
    if (m === 'month') {
      setSelectedMonth(monthList[new Date().getMonth()]);
    }
  };

  const renderItem = ({ item, index }: any) => (
    <View style={styles.item}>
      <Text style={styles.rank}>{index + 1}.</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.points}>
        {mode === 'hall' ? `${item.wins} wins` : `${item.totalPoints} pts`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏆 Leaderboard</Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.activeMode]}
            onPress={() => changeMode(m)}
          >
            <Text style={[styles.modeText, mode === m && styles.activeTabText]}>
              {m === 'live' ? 'Live' : m === 'month' ? 'Monthly' : 'Hall of Fame'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Month picker - only visible in monthly mode */}
      {mode === 'month' && (
        <>
          <TouchableOpacity
            style={styles.monthSelector}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={styles.monthSelectorText}>
              <Ionicons name="calendar" size={16} color="#00ffcc" /> {selectedMonth.name}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={pickerVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setPickerVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Month</Text>
                <Picker
                  selectedValue={selectedMonth.value}
                  onValueChange={(value) => {
                    const selected = monthList.find(m => m.value === value);
                    if (selected) {
                      setSelectedMonth(selected);
                      setPickerVisible(false);
                    }
                  }}
                  style={styles.picker}
                >
                  {monthList.map(month => (
                    <Picker.Item 
                      key={month.value} 
                      label={month.name} 
                      value={month.value} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* List content */}
      {loading ? (
        <ActivityIndicator size="large" color="#26dbc3" style={styles.loader} />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>No data available yet</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.userId}_${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 10,
  },
  modeButton: { 
    paddingVertical: 6, 
    paddingHorizontal: 12 
  },
  modeText: { 
    color: '#888', 
    fontSize: 14 
  },
  activeMode: { 
    borderBottomWidth: 2, 
    borderBottomColor: '#26dbc3' 
  },
  activeTabText: { 
    color: '#26dbc3', 
    fontWeight: 'bold' 
  },
  monthSelector: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  monthSelectorText: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rank: { 
    width: 30, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#aaa' 
  },
  name: { 
    flex: 1, 
    fontSize: 16, 
    color: '#fff' 
  },
  points: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#26dbc3' 
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  picker: {
    color: '#00ffcc',
    backgroundColor: '#1a1a1a',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 40,
  },
});