
// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import axios from '../api/AxiosInstance';
// import { LineChart } from 'react-native-chart-kit';
// import { useAuth } from '../context/AuthContext';
// import RNPickerSelect from 'react-native-picker-select';
// import { ScrollView } from 'react-native-gesture-handler';

// const screenWidth = Dimensions.get('window').width;

// interface HeatmapEntry {
//   _id: {
//     y: number;
//     m: number;
//     d: number;
//   };
//   total: number;
// }

// interface DailyStat {
//   date: string;
//   minutes: number;
// }

// interface HourlyStat {
//   hour: number;
//   minutes: number;
// }

// interface Challenge {
//   _id: string;
//   title: string;
// }

// const chartConfig = {
//   backgroundGradientFrom: '#000',
//   backgroundGradientTo: '#000',
//   color: (opacity = 1) => `rgba(38, 219, 195, ${opacity})`,
//   strokeWidth: 2,
//   decimalPlaces: 0,
//   labelColor: () => '#26dbc3',
//   propsForLabels: {
//     fontSize: 10,
//   },
//   propsForDots: {
//     r: '3',
//     strokeWidth: '1',
//     stroke: '#26dbc3',
//   },
// };

// const heatmapColors = ['#0d0d0d', '#144f4a', '#1c776a', '#20a08a', '#26dbc3'];

// export default function StatsScreen() {
//   const { user, token } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [overview, setOverview] = useState({ today: 0, week: 0, month: 0 });
//   const [dailyData, setDailyData] = useState<DailyStat[]>([]);
//   const [focusBreak, setFocusBreak] = useState({ focusPercent: 0, breakPercent: 0 });
//   const [hourlyStats, setHourlyStats] = useState<HourlyStat[]>([]);
//   const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
//   const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [view, setView] = useState('Overview');

//   const fetchStats = useCallback(async () => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       const responses = await Promise.all([
//         axios.get(`/stats/overview?userId=${user?.id}`, config),
//         axios.get(`/stats/daily?userId=${user?.id}&days=14`, config),
//         axios.get(`/stats/focus-break?userId=${user?.id}`, config),
//         axios.get(`/stats/hourly?userId=${user?.id}`, config),
//         axios.get(`/stats/heatmap?userId=${user?.id}`, config),
//         axios.get(`/challenges/${user?.id}/challenges`, config),
//       ]);
//       setOverview(responses[0].data || { today: 0, week: 0, month: 0 });
//       setDailyData(responses[1].data || []);
//       setFocusBreak(responses[2].data || { focusPercent: 0, breakPercent: 0 });
//       setHourlyStats(responses[3].data || []);
//       setHeatmapData(responses[4].data || []);
//       setChallenges(responses[5].data || []);
//     } catch (e) {
//       console.error('Error fetching stats:', e);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [token, user?.id]);

//   useEffect(() => {
//     if (user) fetchStats();
//   }, [fetchStats, user]);

//   interface HeatmapValue {
//     date: string;
//     count: number;
//   }

//   const transformHeatmapData = (): HeatmapValue[] => {
//     const today = new Date();
//     const base = Array(63).fill(null).map((_, i) => {
//       const d = new Date(today);
//       d.setDate(d.getDate() - (62 - i));
//       return { date: d.toISOString().split('T')[0], count: 0 };
//     });
//     const map = new Map(base.map((d) => [d.date, d]));

//     heatmapData.forEach((entry) => {
//       if (!entry?._id) return;
//       const { y, m, d } = entry._id;
//       const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
//       if (map.has(date)) map.set(date, { date, count: Math.round(entry.total / 60) });
//     });

//     return Array.from(map.values());
//   };

//   const groupIntoWeeks = (data: HeatmapValue[]) => {
//     const grouped = [];
//     for (let i = 0; i < data.length; i += 7) {
//       grouped.push(data.slice(i, i + 7));
//     }
//     return grouped;
//   };

//   const getColor = (count: number) => {
//     if (count === 0) return heatmapColors[0];
//     if (count < 2) return heatmapColors[1];
//     if (count < 4) return heatmapColors[2];
//     if (count < 6) return heatmapColors[3];
//     return heatmapColors[4];
//   };

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#26dbc3" />
//       </View>
//     );
//   }

//   const heatmapWeeks = groupIntoWeeks(transformHeatmapData());

//   return (
//     <ScrollView
//       style={styles.container}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={() => {
//             setRefreshing(true);
//             fetchStats();
//           }}
//           tintColor="#26dbc3"
//           colors={['#26dbc3']}
//         />
//       }
//     >
//       <Text style={styles.title}>Stats</Text>

//       <View style={styles.tabSwitch}>
//         {['Overview', 'Timeline'].map(tab => (
//           <TouchableOpacity
//             key={tab}
//             style={[styles.tab, view === tab && styles.tabActive]}
//             onPress={() => setView(tab)}
//           >
//             <Text style={[styles.tabText, view === tab && styles.tabTextActive]}>{tab}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {view === 'Overview' ? (
//         <>
//           <Text style={styles.section}>History</Text>
//           {dailyData.length > 0 ? (
//             <LineChart
//               data={{
//                 labels: dailyData.map(d => d.date?.slice(5) || ''),
//                 datasets: [{ data: dailyData.map(d => Math.round(d.minutes)) }],
//               }}
//               width={screenWidth - 32}
//               height={180}
//               chartConfig={chartConfig}
//               withInnerLines={false}
//               bezier
//               style={{ borderRadius: 8, marginBottom: 20 }}
//             />
//           ) : (
//             <Text style={styles.noDataText}>No data available</Text>
//           )}

//           <View style={styles.row}>
//             <View>
//               <Text style={styles.section}>Productive Hours</Text>
//               <View style={styles.hourRow}>
//                 {hourlyStats.length > 0 ? (
//                   hourlyStats.slice(6, 15).map((h, i) => (
//                     <View
//                       key={i}
//                       style={[styles.hourBlock, { backgroundColor: getColor(Math.floor(h.minutes / 10)) }]}
//                     />
//                   ))
//                 ) : (
//                   Array.from({ length: 9 }).map((_, i) => (
//                     <View key={i} style={styles.hourBlock} />
//                   ))
//                 )}
//               </View>
//               <Text style={styles.hourLabels}>6AM   9AM   12PM   3PM</Text>
//             </View>

//             <View>
//               <Text style={styles.section}>Heatmap</Text>
//               <View style={styles.heatmapGrid}>
//                 {['Mon', 'Wed', 'Fri'].map((day, i) => (
//                   <Text key={i} style={styles.dayLabel}>{day}</Text>
//                 ))}
//                 <View style={{ flexDirection: 'row' }}>
//                   {heatmapWeeks.map((week, i) => (
//                     <View key={i} style={{ flexDirection: 'column', marginRight: 2 }}>
//                       {week.map((d, j) => (
//                         <View
//                           key={j}
//                           style={[styles.heatBlock, { backgroundColor: getColor(d.count) }]}
//                         />
//                       ))}
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             </View>
//           </View>

//           <Text style={styles.section}>Focus/Break Ratio</Text>
//           <View style={styles.ratioBar}>
//             <View
//               style={{
//                 flex: focusBreak.focusPercent,
//                 backgroundColor: '#26dbc3',
//                 height: 8,
//                 borderTopLeftRadius: 4,
//                 borderBottomLeftRadius: 4,
//               }}
//             />
//             <View
//               style={{
//                 flex: focusBreak.breakPercent,
//                 backgroundColor: '#ff6666',
//                 height: 8,
//                 borderTopRightRadius: 4,
//                 borderBottomRightRadius: 4,
//               }}
//             />
//           </View>
//           <View style={styles.ratioTextRow}>
//             <Text style={styles.ratioLabel}>{Math.round(focusBreak.focusPercent)}%</Text>
//             <Text style={styles.ratioLabel}>{Math.round(focusBreak.breakPercent)}%</Text>
//           </View>
//         </>
//       ) : (
//         <>
//           <Text style={styles.section}>Select Challenge</Text>
//           <RNPickerSelect
//             onValueChange={setSelectedChallenge}
//             value={selectedChallenge}
//             placeholder={{ label: 'All Challenges', value: null }}
//             items={challenges.map((c) => ({ label: c.title, value: c._id }))}
//             style={pickerSelectStyles}
//           />

//           <View style={styles.timelineContainer}>
//             <View style={styles.timelineStatsRow}>
//               <View style={styles.timelineStatCard}>
//                 <Text style={styles.timelineStatValue}>{Math.round(overview.today)}</Text>
//                 <Text style={styles.timelineStatLabel}>Today (min)</Text>
//               </View>
//               <View style={styles.timelineStatCard}>
//                 <Text style={styles.timelineStatValue}>{Math.round(overview.week)}</Text>
//                 <Text style={styles.timelineStatLabel}>This Week (min)</Text>
//               </View>
//               <View style={styles.timelineStatCard}>
//                 <Text style={styles.timelineStatValue}>{Math.round(overview.month)}</Text>
//                 <Text style={styles.timelineStatLabel}>This Month (min)</Text>
//               </View>
//             </View>
//           </View>
//         </>
//       )}
//     </ScrollView>
//   );
// }

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     fontSize: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#333',
//     borderRadius: 8,
//     color: '#fff',
//     paddingRight: 30,
//     backgroundColor: '#1a1a1a',
//     marginBottom: 20,
//   },
//   inputAndroid: {
//     fontSize: 14,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#333',
//     borderRadius: 8,
//     color: '#fff',
//     paddingRight: 30,
//     backgroundColor: '#1a1a1a',
//     marginBottom: 20,
//   },
// });

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000', padding: 16 },
//   loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
//   title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
//   tabSwitch: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 8, marginBottom: 16 },
//   tab: { flex: 1, padding: 12, alignItems: 'center' },
//   tabActive: { backgroundColor: '#26dbc3' },
//   tabText: { color: '#888', fontSize: 14 },
//   tabTextActive: { color: '#000', fontWeight: 'bold' },
//   section: { color: '#26dbc3', fontSize: 14, marginBottom: 10 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
//   hourRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
//   hourBlock: { width: 20, height: 20, borderRadius: 4, margin: 2, backgroundColor: '#144f4a' },
//   hourLabels: { color: '#ccc', fontSize: 10, marginTop: 4 },
//   heatmapGrid: { marginTop: 6 },
//   heatBlock: { width: 12, height: 12, marginVertical: 1 },
//   dayLabel: { color: '#888', fontSize: 10, marginBottom: 2 },
//   ratioBar: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', marginVertical: 10 },
//   ratioTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   ratioLabel: { color: '#ccc', fontSize: 12 },
//   noDataText: { color: '#666', fontSize: 12, textAlign: 'center', marginVertical: 20 },
//   timelineContainer: { marginTop: 10 },
//   timelineStatsRow: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between',
//     marginBottom: 16
//   },
//   timelineStatCard: {
//     backgroundColor: '#1a1a1a',
//     padding: 16,
//     borderRadius: 8,
//     flex: 1,
//     marginHorizontal: 4,
//     alignItems: 'center',
//   },
//   timelineStatValue: { 
//     color: '#fff', 
//     fontSize: 20, 
//     fontWeight: 'bold',
//     marginBottom: 4 
//   },
//   timelineStatLabel: { 
//     color: '#ccc', 
//     fontSize: 12 
//   },
// });
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from '../api/AxiosInstance';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import RNPickerSelect from 'react-native-picker-select';
import { ScrollView } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;

interface HeatmapEntry {
  _id: {
    y: number;
    m: number;
    d: number;
  };
  total: number;
}

interface DailyStat {
  date: string;
  minutes: number;
}

interface HourlyStat {
  hour: number;
  minutes: number;
}

interface Challenge {
  _id: string;
  title: string;
}

const chartConfig = {
  backgroundGradientFrom: '#000',
  backgroundGradientTo: '#000',
  color: (opacity = 1) => `rgba(38, 219, 195, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  labelColor: () => '#26dbc3',
  propsForLabels: {
    fontSize: 10,
  },
  propsForDots: {
    r: '3',
    strokeWidth: '1',
    stroke: '#26dbc3',
  },
};

const heatmapColors = ['#0d0d0d', '#144f4a', '#1c776a', '#20a08a', '#26dbc3'];

export default function StatsScreen() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState({ today: 0, week: 0, month: 0 });
  const [dailyData, setDailyData] = useState<DailyStat[]>([]);
  const [focusBreak, setFocusBreak] = useState({ focusPercent: 0, breakPercent: 0 });
  const [hourlyStats, setHourlyStats] = useState<HourlyStat[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [view, setView] = useState('Overview');

  const fetchStats = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const challengeParam = selectedChallenge ? `&challengeId=${selectedChallenge}` : '';
      
      const responses = await Promise.all([
        axios.get(`/stats/overview?userId=${user?.id}${challengeParam}`, config),
        axios.get(`/stats/daily?userId=${user?.id}&days=14${challengeParam}`, config),
        axios.get(`/stats/focus-break?userId=${user?.id}${challengeParam}`, config),
        axios.get(`/stats/hourly?userId=${user?.id}${challengeParam}`, config),
        axios.get(`/stats/heatmap?userId=${user?.id}${challengeParam}`, config),
        axios.get(`/challenges/${user?.id}/challenges`, config),
      ]);
      
      setOverview(responses[0].data || { today: 0, week: 0, month: 0 });
      setDailyData(responses[1].data || []);
      setFocusBreak(responses[2].data || { focusPercent: 0, breakPercent: 0 });
      setHourlyStats(responses[3].data || []);
      setHeatmapData(responses[4].data || []);
      setChallenges(responses[5].data || []);
    } catch (e) {
      console.error('Error fetching stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user?.id, selectedChallenge]);

  useEffect(() => {
    if (user) fetchStats();
  }, [fetchStats, user]);

  interface HeatmapValue {
    date: string;
    count: number;
  }

  const transformHeatmapData = (): HeatmapValue[] => {
    const today = new Date();
    const base = Array(63).fill(null).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (62 - i));
      return { date: d.toISOString().split('T')[0], count: 0 };
    });
    const map = new Map(base.map((d) => [d.date, d]));

    heatmapData.forEach((entry) => {
      if (!entry?._id) return;
      const { y, m, d } = entry._id;
      const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (map.has(date)) map.set(date, { date, count: Math.round(entry.total / 60) });
    });

    return Array.from(map.values());
  };

  const groupIntoWeeks = (data: HeatmapValue[]) => {
    const grouped = [];
    for (let i = 0; i < data.length; i += 7) {
      grouped.push(data.slice(i, i + 7));
    }
    return grouped;
  };

  const getColor = (count: number) => {
    if (count === 0) return heatmapColors[0];
    if (count < 2) return heatmapColors[1];
    if (count < 4) return heatmapColors[2];
    if (count < 6) return heatmapColors[3];
    return heatmapColors[4];
  };

  const handleChallengeChange = (value: string | null) => {
    setSelectedChallenge(value);
    setRefreshing(true);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#26dbc3" />
      </View>
    );
  }

  const heatmapWeeks = groupIntoWeeks(transformHeatmapData());

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchStats();
          }}
          tintColor="#26dbc3"
          colors={['#26dbc3']}
        />
      }
    >
      <Text style={styles.title}>Stats</Text>

      <View style={styles.tabSwitch}>
        {['Overview', 'Timeline'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, view === tab && styles.tabActive]}
            onPress={() => setView(tab)}
          >
            <Text style={[styles.tabText, view === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === 'Overview' ? (
        <>
          <Text style={styles.section}>History</Text>
          {dailyData.length > 0 ? (
            <LineChart
              data={{
                labels: dailyData.map(d => d.date?.slice(5) || ''),
                datasets: [{ data: dailyData.map(d => Math.round(d.minutes)) }],
              }}
              width={screenWidth - 32}
              height={180}
              chartConfig={chartConfig}
              withInnerLines={false}
              bezier
              style={{ borderRadius: 8, marginBottom: 20 }}
            />
          ) : (
            <Text style={styles.noDataText}>No data available</Text>
          )}

          <View style={styles.row}>
            <View>
              <Text style={styles.section}>Productive Hours</Text>
              <View style={styles.hourRow}>
                {hourlyStats.length > 0 ? (
                  hourlyStats.slice(6, 15).map((h, i) => (
                    <View
                      key={i}
                      style={[styles.hourBlock, { backgroundColor: getColor(Math.floor(h.minutes / 10)) }]}
                    />
                  ))
                ) : (
                  Array.from({ length: 9 }).map((_, i) => (
                    <View key={i} style={styles.hourBlock} />
                  ))
                )}
              </View>
              <Text style={styles.hourLabels}>6AM   9AM   12PM   3PM</Text>
            </View>

            <View>
              <Text style={styles.section}>Heatmap</Text>
              <View style={styles.heatmapGrid}>
                {['Mon', 'Wed', 'Fri'].map((day, i) => (
                  <Text key={i} style={styles.dayLabel}>{day}</Text>
                ))}
                <View style={{ flexDirection: 'row' }}>
                  {heatmapWeeks.map((week, i) => (
                    <View key={i} style={{ flexDirection: 'column', marginRight: 2 }}>
                      {week.map((d, j) => (
                        <View
                          key={j}
                          style={[styles.heatBlock, { backgroundColor: getColor(d.count) }]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.section}>Focus/Break Ratio</Text>
          <View style={styles.ratioBar}>
            <View
              style={{
                flex: focusBreak.focusPercent,
                backgroundColor: '#26dbc3',
                height: 8,
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
              }}
            />
            <View
              style={{
                flex: focusBreak.breakPercent,
                backgroundColor: '#ff6666',
                height: 8,
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
              }}
            />
          </View>
          <View style={styles.ratioTextRow}>
            <Text style={styles.ratioLabel}>{Math.round(focusBreak.focusPercent)}%</Text>
            <Text style={styles.ratioLabel}>{Math.round(focusBreak.breakPercent)}%</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.section}>Select Challenge</Text>
          <RNPickerSelect
            onValueChange={handleChallengeChange}
            value={selectedChallenge}
            placeholder={{ label: 'All Challenges', value: null }}
            items={challenges.map((c) => ({ label: c.title, value: c._id }))}
            style={pickerSelectStyles}
          />

          <View style={styles.timelineContainer}>
            <View style={styles.timelineStatsRow}>
              <View style={styles.timelineStatCard}>
                <Text style={styles.timelineStatValue}>{Math.round(overview.today)}</Text>
                <Text style={styles.timelineStatLabel}>Today (min)</Text>
              </View>
              <View style={styles.timelineStatCard}>
                <Text style={styles.timelineStatValue}>{Math.round(overview.week)}</Text>
                <Text style={styles.timelineStatLabel}>This Week (min)</Text>
              </View>
              <View style={styles.timelineStatCard}>
                <Text style={styles.timelineStatValue}>{Math.round(overview.month)}</Text>
                <Text style={styles.timelineStatLabel}>This Month (min)</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    color: '#fff',
    paddingRight: 30,
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    color: '#fff',
    paddingRight: 30,
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  tabSwitch: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#26dbc3' },
  tabText: { color: '#888', fontSize: 14 },
  tabTextActive: { color: '#000', fontWeight: 'bold' },
  section: { color: '#26dbc3', fontSize: 14, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  hourRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  hourBlock: { width: 20, height: 20, borderRadius: 4, margin: 2, backgroundColor: '#144f4a' },
  hourLabels: { color: '#ccc', fontSize: 10, marginTop: 4 },
  heatmapGrid: { marginTop: 6 },
  heatBlock: { width: 12, height: 12, marginVertical: 1 },
  dayLabel: { color: '#888', fontSize: 10, marginBottom: 2 },
  ratioBar: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', marginVertical: 10 },
  ratioTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ratioLabel: { color: '#ccc', fontSize: 12 },
  noDataText: { color: '#666', fontSize: 12, textAlign: 'center', marginVertical: 20 },
  timelineContainer: { marginTop: 10 },
  timelineStatsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 16
  },
  timelineStatCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  timelineStatValue: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold',
    marginBottom: 4 
  },
  timelineStatLabel: { 
    color: '#ccc', 
    fontSize: 12 
  },
});