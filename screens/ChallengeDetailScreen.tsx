
// import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   Animated,
//   Alert,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { useAuth } from '../context/AuthContext';
// import { useNavigation } from '@react-navigation/native';
// import { Audio } from 'expo-av';
// import axiosInstance from '../api/AxiosInstance';
// import DeleteChallengeButton from '../components/DeleteChallengeButton';
// import { useChallengeSocket } from '../context/useChallengeSocket';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/types';

// interface RouteParams {
//   challengeId: string;
// }

// interface Participant {
//   user: {
//     id: string;
//     name: string;
//     profileColor?: string;
//   };
//   secondsCompleted: number;
//   currentSessionStart?: string | null;
//   pointsEarned?: number;
// }

// interface Challenge {
//   _id: string;
//   title: string;
//   totalHours: number;
//   durationDays: number;
//   startDate: string;
//   endDate: string;
//   totalPoints: number;
//   status: 'Waiting' | 'Active' | 'Completed';
//   creator: string | { _id: string; name?: string };
//   participants: Participant[];
//   hashtags?: string[];
// }

// const SOUNDS = {
//   START: require('../assets/sounds/start.wav'),
//   COMPLETE: require('../assets/sounds/complete.wav'),
// };

// const SYNC_INTERVAL = 5;

// export default function ChallengeDetailScreen() {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const route = useRoute();
//   const { challengeId } = route.params as RouteParams;
//   const { token, user } = useAuth();

//   const [challenge, setChallenge] = useState<Challenge | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [sessionActive, setSessionActive] = useState(false);
//   const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
//   const [challengeCompletedSoundPlayed, setChallengeCompletedSoundPlayed] = useState(false);
//   const [secondsCompletedMap, setSecondsCompletedMap] = useState<Record<string, number>>({});
//   const [userTotalTime, setUserTotalTime] = useState(0);

//   const animatedProgresses = useRef<Record<string, Animated.Value>>({});
//   const sounds = useRef<{ start: Audio.Sound | null; complete: Audio.Sound | null }>({
//     start: null,
//     complete: null,
//   });
//   const syncCounter = useRef(0);

//   const creatorId = useMemo(() => {
//     return typeof challenge?.creator === 'string' ? challenge.creator : challenge?.creator?._id;
//   }, [challenge]);

//   const totalDurationSeconds = useMemo(() => {
//     return challenge ? challenge.totalHours * 3600 : 0;
//   }, [challenge]);

//   const getProgressPercent = (secondsCompleted: number) => {
//     return Math.min((secondsCompleted / totalDurationSeconds) * 100, 100);
//   };

//   const formatTime = (seconds: number) => {
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     const pad = (num: number) => String(num).padStart(2, '0');
//     return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const calculatePoints = (secondsCompleted: number) => {
//     const percentage = Math.min(secondsCompleted / totalDurationSeconds, 1);
//     return Math.floor(percentage * (challenge?.totalPoints || 0));
//   };

//   const initializeAnimatedProgresses = (participants: Participant[]) => {
//     participants.forEach((p) => {
//       const userId = p.user.id;
//       if (!animatedProgresses.current[userId]) {
//         const initialPercent = getProgressPercent(p.secondsCompleted);
//         animatedProgresses.current[userId] = new Animated.Value(initialPercent);
//       }
//     });
//   };

//   const handleCompleteChallenge = useCallback(async () => {
//     try {
//       if (creatorId === user?.id) {
//         await axiosInstance.post(
//           `/challenges/${challengeId}/complete`,
//           {},
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//       }
//       setSessionActive(false);
//       sounds.current.complete?.replayAsync();
//       await fetchChallenge();
//     } catch (err) {
//       console.error('Error completing challenge:', err);
//       await fetchChallenge();
//     }
//   }, [challengeId, token, user?.id, creatorId]);

//   const fetchChallenge = useCallback(async () => {
//     try {
//       const res = await axiosInstance.get(`/challenges/${challengeId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data: Challenge = res.data;
      
//       const normalizedParticipants = data.participants.map(p => {
//         const userObj = typeof p.user === 'string' 
//           ? { id: p.user, name: 'Loading...' } 
//           : p.user;
        
//         const user = {
//           id: userObj.id || (userObj as any)._id,
//           name: userObj.name || 'Anonymous',
//           profileColor: userObj.profileColor
//         };

//         return {
//           user,
//           secondsCompleted: p.secondsCompleted,
//           currentSessionStart: p.currentSessionStart,
//           pointsEarned: p.pointsEarned,
//         };
//       });

//       setChallenge(data);
//       initializeAnimatedProgresses(normalizedParticipants);

//       const userId = user?.id;
//       const participant = normalizedParticipants.find(p => p.user.id === userId);
//       if (participant?.currentSessionStart && data.status === 'Active') {
//         setSessionActive(true);
//       } else {
//         setSessionActive(false);
//       }

//       if (participant) {
//         setUserTotalTime(participant.secondsCompleted);
//       }

//       const newMap = normalizedParticipants.reduce((acc, p) => {
//         acc[p.user.id] = p.secondsCompleted;
//         return acc;
//       }, {} as Record<string, number>);
//       setSecondsCompletedMap(newMap);

//       if (data.status !== 'Completed') {
//         setChallengeCompletedSoundPlayed(false);
//       }

//       if (data.status === 'Active') {
//         const endTime = new Date(data.endDate).getTime();
//         if (Date.now() >= endTime) {
//           await handleCompleteChallenge();
//         }
//       }
//     } catch (err) {
//       console.error('Failed to load challenge', err);
//       Alert.alert('Error', 'Failed to load challenge data.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [challengeId, token, user?.id, handleCompleteChallenge]);


//   const socketHandlers = useCallback((update: {
//     _id: string;
//     status: 'Waiting' | 'Active' | 'Completed';
//     participants: Array<{
//       user: string | { _id?: string, id?: string, name: string, profileColor?: string };
//       secondsCompleted: number;
//       currentSessionStart?: string | null;
//       pointsEarned?: number;
//     }>;
//     startDate?: string;
//     endDate?: string;
//   }) => {
//     if (update._id !== challengeId) return;

//     setChallenge((prev) => {
//       if (!prev) return prev;

//       const existingParticipantsMap = prev.participants.reduce((map, p) => {
//         map[p.user.id] = p;
//         return map;
//       }, {} as Record<string, Participant>);

//       const updatedParticipants = update.participants.map(socketParticipant => {
//         let userId: string;
//         let userName: string;
//         let userProfileColor: string | undefined;

//         if (typeof socketParticipant.user === 'string') {
//           userId = socketParticipant.user;
//           userName = 'Anonymous';
//         } else {
//           userId = socketParticipant.user.id || (socketParticipant.user as any)._id;
//           userName = socketParticipant.user.name || 'Anonymous';
//           userProfileColor = socketParticipant.user.profileColor;
//         }

//         const existingParticipant = existingParticipantsMap[userId];
//         return {
//           user: {
//             id: userId,
//             name: existingParticipant?.user.name || userName,
//             profileColor: existingParticipant?.user.profileColor || userProfileColor
//           },
//           secondsCompleted: socketParticipant.secondsCompleted,
//           currentSessionStart: socketParticipant.currentSessionStart,
//           pointsEarned: socketParticipant.pointsEarned,
//         };
//       });

//       if (update.status === 'Active' && prev.status !== 'Active') {
//         const userParticipant = updatedParticipants.find(p => p.user.id === user?.id);
//         if (userParticipant?.currentSessionStart) {
//           setSessionActive(true);
//           sounds.current.start?.replayAsync();
//           Alert.alert('Challenge Started', 'Your session has automatically begun!');
//         }
//       }

//       if (update.status === 'Completed' && prev.status !== 'Completed') {
//         setSessionActive(false);
//         setChallengeCompletedSoundPlayed(true);
//         sounds.current.complete?.replayAsync();
//       }

//       return {
//         ...prev,
//         status: update.status,
//         participants: updatedParticipants,
//         startDate: update.startDate || prev.startDate,
//         endDate: update.endDate || prev.endDate,
//       };
//     });

//     setSecondsCompletedMap(prev => {
//       const newMap = {...prev};
//       update.participants.forEach(p => {
//         const userId = typeof p.user === 'string' ? p.user : p.user.id || (p.user as any)._id;
//         newMap[userId] = p.secondsCompleted;
//       });
//       return newMap;
//     });
//   }, [challengeId, user?.id]);

//   const { sendProgressUpdate } = useChallengeSocket(challengeId, socketHandlers);

//   useEffect(() => {
//     fetchChallenge();
//   }, [fetchChallenge]);

//   useEffect(() => {
//     const loadSounds = async () => {
//       try {
//         const { sound: start } = await Audio.Sound.createAsync(SOUNDS.START);
//         const { sound: complete } = await Audio.Sound.createAsync(SOUNDS.COMPLETE);
//         sounds.current = { start, complete };
//       } catch (e) {
//         console.warn('Error loading sounds', e);
//       }
//     };

//     loadSounds();

//     return () => {
//       sounds.current.start?.unloadAsync();
//       sounds.current.complete?.unloadAsync();
//     };
//   }, []);

//   useEffect(() => {
//     if (!challenge || challenge.status !== 'Active') {
//       setRemainingSeconds(null);
//       return;
//     }

//     const endTimeMs = new Date(challenge.endDate).getTime();
//     const interval = setInterval(() => {
//       const now = Date.now();
//       const diffSeconds = Math.max(0, Math.floor((endTimeMs - now) / 1000));
//       setRemainingSeconds(diffSeconds);

//       if (diffSeconds === 0 && !challengeCompletedSoundPlayed) {
//         sounds.current.complete?.replayAsync();
//         setChallengeCompletedSoundPlayed(true);
//         setSessionActive(false);
//         if (challenge.status !== 'Completed') {
//           fetchChallenge().catch(console.error);
//         }
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [challenge, challengeCompletedSoundPlayed, fetchChallenge]);

//   useEffect(() => {
//     if (!challenge || !sessionActive || !user?.id || challenge.status === 'Completed') return;

//     const totalSeconds = challenge.totalHours * 3600;

//     const interval = setInterval(() => {
//       setChallenge((prev) => {
//         if (!prev || prev.status === 'Completed') return prev;

//         const updatedParticipants = prev.participants.map((p) => {
//           if (p.user.id !== user.id) return p;

//           // Don't go beyond totalSeconds
//           const cappedSeconds = Math.min(p.secondsCompleted + 1, totalSeconds);

//           return {
//             ...p,
//             secondsCompleted: cappedSeconds,
//           };
//         });

//         const self = updatedParticipants.find((p) => p.user.id === user.id);
//         if (self) {
//           const percent = getProgressPercent(self.secondsCompleted);

//           if (!animatedProgresses.current[self.user.id]) {
//             animatedProgresses.current[self.user.id] = new Animated.Value(percent);
//           }

//           Animated.timing(animatedProgresses.current[self.user.id], {
//             toValue: percent,
//             duration: 800,
//             useNativeDriver: false,
//           }).start();

//           setUserTotalTime(self.secondsCompleted);
//         }

//         // Stop session if we've reached the goal
//         if (self && self.secondsCompleted >= totalSeconds) {
//           setSessionActive(false);
//         }

//         return { ...prev, participants: updatedParticipants };
//       });

//       syncCounter.current++;
//       if (syncCounter.current >= SYNC_INTERVAL) {
//         syncCounter.current = 0;
//         sendProgressUpdate();
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [sessionActive, challenge, user?.id, sendProgressUpdate]);
// //new
// useEffect(() => {
//   if (!challenge || !user?.id) return;

//   const me = challenge.participants.find(p => p.user.id === user.id);
//   const totalSeconds = challenge.totalHours * 3600;

//   // restore session on load
//   if (me?.currentSessionStart && me.secondsCompleted < totalSeconds) {
//     setSessionActive(true);
//     setUserTotalTime(me.secondsCompleted);
//   }

//   // auto mark done
//   if (me && me?.secondsCompleted >= totalSeconds) {
//     setSessionActive(false);
//   }
// }, [challenge, user?.id]);
// //

//   const handleStartSession = async () => {
//     try {
//       await axiosInstance.post(
//         `/challenges/${challengeId}/start`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSessionActive(true);
//       sounds.current.start?.replayAsync();
//     } catch (err: any) {
//       Alert.alert('Error', err?.response?.data?.msg || 'Could not start session.');
//     }
//   };

//   const handleStopSession = async () => {
//     try {
//       await axiosInstance.post(
//         `/challenges/${challengeId}/stop`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSessionActive(false);
//     } catch (err: any) {
//       Alert.alert('Error', err?.response?.data?.msg || 'Could not stop session.');
//     }
//   };

//   const handleStartChallenge = async () => {
//     try {
//       await axiosInstance.post(
//         `/challenges/${challengeId}/start-challenge`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       sounds.current.start?.replayAsync();
//       await fetchChallenge();
//     } catch (err: any) {
//       Alert.alert('Error', err?.response?.data?.msg || 'Could not start challenge.');
//     }
//   };

//   const sortedParticipants = useMemo(() => {
//     if (!challenge?.participants) return [];
//     return [...challenge.participants].sort((a, b) => {
//       const aSec = secondsCompletedMap[a.user.id] ?? a.secondsCompleted;
//       const bSec = secondsCompletedMap[b.user.id] ?? b.secondsCompleted;
//       return bSec - aSec;
//     });
//   }, [challenge, secondsCompletedMap]);

//   // const renderTimeSummary = () => {
//   //   if (challenge?.status !== 'Completed') return null;
    
//   //   const winner = [...challenge.participants].sort((a, b) => 
//   //     b.secondsCompleted - a.secondsCompleted
//   //   )[0];

//   //   const userParticipant = challenge.participants.find(p => p.user.id === user?.id);
//   //   const userPoints = userParticipant?.pointsEarned || 0;
//   //   const winnerPoints = winner.pointsEarned || 0;
//   //   const isWinner = user?.id === winner.user.id;

//   //   return (
//   //     <View style={styles.timeSummaryContainer}>
//   //       <Text style={[styles.winnerText, isWinner && styles.winnerHighlight]}>
//   //         {isWinner ? '🎉 You Won! 🎉' : `🎉 Winner: ${winner.user.name} 🎉`}
//   //       </Text>
//   //       <Text style={styles.timeSummaryText}>
//   //         Your Score: {userPoints}/{challenge.totalPoints}
//   //       </Text>
//   //       {!isWinner && (
//   //         <Text style={styles.winnerScoreText}>
//   //           Winner's Score: {winnerPoints}/{challenge.totalPoints}
//   //         </Text>
//   //       )}
//   //     </View>
//   //   );
//   // };


// const renderProgressBars = () => {
//   if (!challenge) return null;

//   return (
//     <>
//       <Text style={styles.leaderboardHeader}>Progress</Text>
//       {sortedParticipants.map((p) => {
//         // Use immediate values from state rather than waiting for animation
//         const currentSeconds = secondsCompletedMap[p.user.id] ?? p.secondsCompleted;
//         const percentCompleted = Math.round(getProgressPercent(currentSeconds));
//         const isComplete = percentCompleted >= 100;
//         const points = p.pointsEarned || calculatePoints(currentSeconds);

//         return (
//           <View key={`progress-${p.user.id}`} style={{ marginBottom: 12 }}>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//               <Text style={[styles.participantText, { marginBottom: 4 }]}>
//                 {p.user.name || 'Anon'}
//                 {isComplete && ' ✅'}
//               </Text>
//               <Text style={[styles.participantText, { marginBottom: 4 }]}>
//                 {percentCompleted}% ({points} pts)
//               </Text>
//             </View>
//             <View style={styles.individualProgressBarBackground}>
//               <Animated.View
//                 style={[
//                   styles.individualProgressBarFill,
//                   {
//                     width: `${percentCompleted}%`, // Use immediate value
//                     backgroundColor: p.user.profileColor || '#00ffcc',
//                   },
//                 ]}
//               />
//             </View>
//           </View>
//         );
//       })}
//     </>
//   );
// };

//   const renderLeaderboard = () => (
//     <>
//       <Text style={styles.leaderboardHeader}>Leaderboard</Text>
//       {sortedParticipants.map((p, index) => {
//         const secondsCompleted = secondsCompletedMap[p.user.id] ?? p.secondsCompleted;
//         const points = p.pointsEarned || calculatePoints(secondsCompleted);
//         const isComplete = getProgressPercent(secondsCompleted) >= 100;
        
//         return (
//           <View key={`leaderboard-${p.user.id}-${index}`} style={styles.participantRow}>
//             <View style={[styles.colorDot, { backgroundColor: p.user.profileColor || '#00ffcc' }]} />
//             <Text style={styles.participantText}>
//               #{index + 1} {p.user.name || 'Anon'}: {formatTime(secondsCompleted)} ({points} pts)
//               {isComplete && ' ✅'}
//             </Text>
//           </View>
//         );
//       })}
//     </>
//   );

//   const renderChallengeControls = () => {
//     if (challenge?.status === 'Waiting' && creatorId === user?.id) {
//       return (
//         <TouchableOpacity onPress={handleStartChallenge} style={styles.activateButton}>
//           <Text style={styles.activateButtonText}>Start Challenge</Text>
//         </TouchableOpacity>
//       );
//     }

//     if (challenge?.status === 'Active') {

//       const userParticipant = challenge.participants.find(p => p.user.id === user?.id);
// const autoStarted = !!userParticipant?.currentSessionStart;
// const completed = userParticipant ? userParticipant.secondsCompleted >= totalDurationSeconds : false;

//       if (!autoStarted && !completed) {
//         return (
//           <View style={styles.sessionButtonsContainer}>
//             <TouchableOpacity
//               onPress={handleStartSession}
//               style={styles.sessionButton}
//             >
//               <Text style={styles.sessionButtonText}>Start Session</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       }

//       if (autoStarted && !completed) {
//         return (
//           <View style={styles.sessionButtonsContainer}>
//             <TouchableOpacity
//               onPress={handleStopSession}
//               style={styles.sessionButton}
//             >
//               <Text style={styles.sessionButtonText}>Stop Session</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       }
//     }

//     return null;
//   };


//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#00ffcc" />
//       </View>
//     );
//   }

//   if (!challenge) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.errorText}>Challenge not found.</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       style={styles.container}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={() => {
//             setRefreshing(true);
//             fetchChallenge();
//           }}
//           colors={['#00ffcc']}
//           tintColor="#00ffcc"
//         />
//       }
//     >
//       <Text style={styles.title}>{challenge.title}</Text>
//       <View style={styles.headerRow}>
//         <Text style={styles.subtitle}>
//           {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
//         </Text>
//       </View>
//       <View style={styles.headerRow}>
//         <Text style={styles.subtitle}>
//           Goal: {challenge.totalHours}h in {challenge.durationDays} days
//         </Text>
//       </View>
      
//       <View style={styles.headerRow}>
//         <Text style={styles.subtitle}>
//           Points: {challenge.totalPoints}
//         </Text>
//         {remainingSeconds !== null && (
//           <Text style={styles.subtitle}>
//             Time left: {formatTime(remainingSeconds)}
//           </Text>
//         )}
//       </View>

//       {renderChallengeControls()}
//       {renderProgressBars()}
//       {renderLeaderboard()}
//       {/* {renderTimeSummary()} */}

//       {creatorId === user?.id && token && (
//         <DeleteChallengeButton
//           challengeId={challenge._id}
//           token={token}
//           onDeleted={() => navigation.goBack()}
//         />
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0e0e0e', padding: 16 },
//   title: { fontFamily: 'PressStart2P', fontSize: 12, color: '#00ffcc', marginBottom: 8 },
//   subtitle: { fontFamily: 'PressStart2P', fontSize: 8, color: '#ccc', marginBottom: 16 },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   activateButton: { backgroundColor: '#00ffcc', padding: 10, borderRadius: 6, marginBottom: 20 },
//   activateButtonText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 8,
//     color: '#000',
//     textAlign: 'center',
//   },
//   sessionButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     gap: 8,
//   },
//   sessionButton: {
//     flex: 1,
//     backgroundColor: '#00ffcc',
//     padding: 10,
//     borderRadius: 6,
//   },
//   sessionButtonText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 8,
//     color: '#000',
//     textAlign: 'center',
//   },
//   leaderboardHeader: {
//     fontFamily: 'PressStart2P',
//     fontSize: 16,
//     color: '#00ffcc',
//     marginBottom: 12,
//     marginTop: 20,
//   },
//   participantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
//   colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
//   participantText: { fontFamily: 'PressStart2P', fontSize: 8, color: '#fff' },
//   individualProgressBarBackground: {
//     height: 12,
//     backgroundColor: '#222',
//     borderRadius: 6,
//     overflow: 'hidden',
//   },
//   individualProgressBarFill: { height: '100%', borderRadius: 6 },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#0e0e0e',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: { fontFamily: 'PressStart2P', fontSize: 10, color: 'red' },
//   timeSummaryContainer: {
//     marginTop: 20,
//     marginBottom: 10,
//     padding: 10,
//     backgroundColor: '#1a1a1a',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   winnerText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 12,
//     color: '#FFD700',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   winnerHighlight: {
//     color: '#00ffcc',
//     fontSize: 14,
//   },
//   timeSummaryText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#00ffcc',
//     marginBottom: 5,
//   },
//   winnerScoreText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#FFD700',
//     marginBottom: 5,
//   },
// });

2
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import axiosInstance from '../api/AxiosInstance';
import DeleteChallengeButton from '../components/DeleteChallengeButton';
import { useChallengeSocket } from '../context/useChallengeSocket';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

interface RouteParams {
  challengeId: string;
}

interface Participant {
  user: {
    id: string;
    name: string;
    profileColor?: string;
  };
  secondsCompleted: number;
  currentSessionStart?: string | null;
  pointsEarned?: number;
}

interface Challenge {
  _id: string;
  title: string;
  totalHours: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  totalPoints: number;
  status: 'Waiting' | 'Active' | 'Completed';
  creator: string | { _id: string; name?: string };
  participants: Participant[];
  hashtags?: string[];
  description?: string;
}

const SOUNDS = {
  START: require('../assets/sounds/start.wav'),
  COMPLETE: require('../assets/sounds/complete.wav'),
};

const SYNC_INTERVAL = 5;

export default function ChallengeDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { challengeId } = route.params as RouteParams;
  const { token, user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [challengeCompletedSoundPlayed, setChallengeCompletedSoundPlayed] = useState(false);
  const [secondsCompletedMap, setSecondsCompletedMap] = useState<Record<string, number>>({});
  const [userTotalTime, setUserTotalTime] = useState(0);

  const animatedProgresses = useRef<Record<string, Animated.Value>>({});
  const sounds = useRef<{ start: Audio.Sound | null; complete: Audio.Sound | null }>({
    start: null,
    complete: null,
  });
  const syncCounter = useRef(0);

  const creatorId = useMemo(() => {
    return typeof challenge?.creator === 'string' ? challenge.creator : challenge?.creator?._id;
  }, [challenge]);

  const totalDurationSeconds = useMemo(() => {
    return challenge ? challenge.totalHours * 3600 : 0;
  }, [challenge]);

  const getProgressPercent = (secondsCompleted: number) => {
    return Math.min((secondsCompleted / totalDurationSeconds) * 100, 100);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculatePoints = (secondsCompleted: number) => {
    const percentage = Math.min(secondsCompleted / totalDurationSeconds, 1);
    return Math.floor(percentage * (challenge?.totalPoints || 0));
  };

  const calculateDailyGoal = () => {
    if (!challenge) return { dailyGoalSeconds: 0, remainingDailySeconds: 0 };
    
    const dailyGoalSeconds = (challenge.totalHours * 3600) / challenge.durationDays;
    const elapsedDays = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = dailyGoalSeconds * (elapsedDays + 1);
    const remainingDailySeconds = Math.max(0, expectedProgress - (userTotalTime || 0));
    
    return { dailyGoalSeconds, remainingDailySeconds };
  };

  const initializeAnimatedProgresses = (participants: Participant[]) => {
    participants.forEach((p) => {
      const userId = p.user.id;
      if (!animatedProgresses.current[userId]) {
        const initialPercent = getProgressPercent(p.secondsCompleted);
        animatedProgresses.current[userId] = new Animated.Value(initialPercent);
      }
    });
  };

  const handleCompleteChallenge = useCallback(async () => {
    try {
      if (creatorId === user?.id) {
        await axiosInstance.post(
          `/challenges/${challengeId}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setSessionActive(false);
      sounds.current.complete?.replayAsync();
      await fetchChallenge();
    } catch (err) {
      console.error('Error completing challenge:', err);
      await fetchChallenge();
    }
  }, [challengeId, token, user?.id, creatorId]);

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/challenges/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Challenge = res.data;
      
      const normalizedParticipants = data.participants.map(p => {
        const userObj = typeof p.user === 'string' 
          ? { id: p.user, name: 'Loading...' } 
          : p.user;
        
        const user = {
          id: userObj.id || (userObj as any)._id,
          name: userObj.name || 'Anonymous',
          profileColor: userObj.profileColor
        };

        return {
          user,
          secondsCompleted: p.secondsCompleted,
          currentSessionStart: p.currentSessionStart,
          pointsEarned: p.pointsEarned,
        };
      });

      setChallenge(data);
      initializeAnimatedProgresses(normalizedParticipants);

      const userId = user?.id;
      const participant = normalizedParticipants.find(p => p.user.id === userId);
      if (participant?.currentSessionStart && data.status === 'Active') {
        setSessionActive(true);
      } else {
        setSessionActive(false);
      }

      if (participant) {
        setUserTotalTime(participant.secondsCompleted);
      }

      const newMap = normalizedParticipants.reduce((acc, p) => {
        acc[p.user.id] = p.secondsCompleted;
        return acc;
      }, {} as Record<string, number>);
      setSecondsCompletedMap(newMap);

      if (data.status !== 'Completed') {
        setChallengeCompletedSoundPlayed(false);
      }

      if (data.status === 'Active') {
        const endTime = new Date(data.endDate).getTime();
        if (Date.now() >= endTime) {
          await handleCompleteChallenge();
        }
      }
    } catch (err) {
      console.error('Failed to load challenge', err);
      Alert.alert('Error', 'Failed to load challenge data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [challengeId, token, user?.id, handleCompleteChallenge]);

  const socketHandlers = useCallback((update: {
    _id: string;
    status: 'Waiting' | 'Active' | 'Completed';
    participants: Array<{
      user: string | { _id?: string, id?: string, name: string, profileColor?: string };
      secondsCompleted: number;
      currentSessionStart?: string | null;
      pointsEarned?: number;
    }>;
    startDate?: string;
    endDate?: string;
  }) => {
    if (update._id !== challengeId) return;

    setChallenge((prev) => {
      if (!prev) return prev;

      const existingParticipantsMap = prev.participants.reduce((map, p) => {
        map[p.user.id] = p;
        return map;
      }, {} as Record<string, Participant>);

      const updatedParticipants = update.participants.map(socketParticipant => {
        let userId: string;
        let userName: string;
        let userProfileColor: string | undefined;

        if (typeof socketParticipant.user === 'string') {
          userId = socketParticipant.user;
          userName = 'Anonymous';
        } else {
          userId = socketParticipant.user.id || (socketParticipant.user as any)._id;
          userName = socketParticipant.user.name || 'Anonymous';
          userProfileColor = socketParticipant.user.profileColor;
        }

        const existingParticipant = existingParticipantsMap[userId];
        return {
          user: {
            id: userId,
            name: existingParticipant?.user.name || userName,
            profileColor: existingParticipant?.user.profileColor || userProfileColor
          },
          secondsCompleted: socketParticipant.secondsCompleted,
          currentSessionStart: socketParticipant.currentSessionStart,
          pointsEarned: socketParticipant.pointsEarned,
        };
      });

      if (update.status === 'Active' && prev.status !== 'Active') {
        const userParticipant = updatedParticipants.find(p => p.user.id === user?.id);
        if (userParticipant?.currentSessionStart) {
          setSessionActive(true);
          sounds.current.start?.replayAsync();
          Alert.alert('Challenge Started', 'Your session has automatically begun!');
        }
      }

      if (update.status === 'Completed' && prev.status !== 'Completed') {
        setSessionActive(false);
        setChallengeCompletedSoundPlayed(true);
        sounds.current.complete?.replayAsync();
      }

      return {
        ...prev,
        status: update.status,
        participants: updatedParticipants,
        startDate: update.startDate || prev.startDate,
        endDate: update.endDate || prev.endDate,
      };
    });

    setSecondsCompletedMap(prev => {
      const newMap = {...prev};
      update.participants.forEach(p => {
        const userId = typeof p.user === 'string' ? p.user : p.user.id || (p.user as any)._id;
        newMap[userId] = p.secondsCompleted;
      });
      return newMap;
    });
  }, [challengeId, user?.id]);

  const { sendProgressUpdate } = useChallengeSocket(challengeId, socketHandlers);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: start } = await Audio.Sound.createAsync(SOUNDS.START);
        const { sound: complete } = await Audio.Sound.createAsync(SOUNDS.COMPLETE);
        sounds.current = { start, complete };
      } catch (e) {
        console.warn('Error loading sounds', e);
      }
    };

    loadSounds();

    return () => {
      sounds.current.start?.unloadAsync();
      sounds.current.complete?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (!challenge || challenge.status !== 'Active') {
      setRemainingSeconds(null);
      return;
    }

    const endTimeMs = new Date(challenge.endDate).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((endTimeMs - now) / 1000));
      setRemainingSeconds(diffSeconds);

      if (diffSeconds === 0 && !challengeCompletedSoundPlayed) {
        sounds.current.complete?.replayAsync();
        setChallengeCompletedSoundPlayed(true);
        setSessionActive(false);
        if (challenge.status !== 'Completed') {
          fetchChallenge().catch(console.error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge, challengeCompletedSoundPlayed, fetchChallenge]);

  useEffect(() => {
    if (!challenge || !sessionActive || !user?.id || challenge.status === 'Completed') return;

    const totalSeconds = challenge.totalHours * 3600;

    const interval = setInterval(() => {
      setChallenge((prev) => {
        if (!prev || prev.status === 'Completed') return prev;

        const updatedParticipants = prev.participants.map((p) => {
          if (p.user.id !== user.id) return p;

          const cappedSeconds = Math.min(p.secondsCompleted + 1, totalSeconds);

          return {
            ...p,
            secondsCompleted: cappedSeconds,
          };
        });

        const self = updatedParticipants.find((p) => p.user.id === user.id);
        if (self) {
          const percent = getProgressPercent(self.secondsCompleted);

          if (!animatedProgresses.current[self.user.id]) {
            animatedProgresses.current[self.user.id] = new Animated.Value(percent);
          }

          Animated.timing(animatedProgresses.current[self.user.id], {
            toValue: percent,
            duration: 800,
            useNativeDriver: false,
          }).start();

          setUserTotalTime(self.secondsCompleted);
        }

        if (self && self.secondsCompleted >= totalSeconds) {
          setSessionActive(false);
        }

        return { ...prev, participants: updatedParticipants };
      });

      syncCounter.current++;
      if (syncCounter.current >= SYNC_INTERVAL) {
        syncCounter.current = 0;
        sendProgressUpdate();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, challenge, user?.id, sendProgressUpdate]);

  useEffect(() => {
    if (!challenge || !user?.id) return;

    const me = challenge.participants.find(p => p.user.id === user.id);
    const totalSeconds = challenge.totalHours * 3600;

    if (me?.currentSessionStart && me.secondsCompleted < totalSeconds) {
      setSessionActive(true);
      setUserTotalTime(me.secondsCompleted);
    }

    if (me && me?.secondsCompleted >= totalSeconds) {
      setSessionActive(false);
    }
  }, [challenge, user?.id]);

  const handleStartSession = async () => {
    try {
      await axiosInstance.post(
        `/challenges/${challengeId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionActive(true);
      sounds.current.start?.replayAsync();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.msg || 'Could not start session.');
    }
  };

  const handleStopSession = async () => {
    try {
      await axiosInstance.post(
        `/challenges/${challengeId}/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionActive(false);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.msg || 'Could not stop session.');
    }
  };

  const handleStartChallenge = async () => {
    try {
      await axiosInstance.post(
        `/challenges/${challengeId}/start-challenge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      sounds.current.start?.replayAsync();
      await fetchChallenge();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.msg || 'Could not start challenge.');
    }
  };

  const sortedParticipants = useMemo(() => {
    if (!challenge?.participants) return [];
    return [...challenge.participants].sort((a, b) => {
      const aSec = secondsCompletedMap[a.user.id] ?? a.secondsCompleted;
      const bSec = secondsCompletedMap[b.user.id] ?? b.secondsCompleted;
      return bSec - aSec;
    });
  }, [challenge, secondsCompletedMap]);

  const renderTimeSummary = () => {
    if (challenge?.status !== 'Completed') return null;
    
    const winner = [...challenge.participants].sort((a, b) => 
      b.secondsCompleted - a.secondsCompleted
    )[0];

    const userParticipant = challenge.participants.find(p => p.user.id === user?.id);
    const userPoints = userParticipant?.pointsEarned || 0;
    const winnerPoints = winner.pointsEarned || 0;
    const isWinner = user?.id === winner.user.id;

    return (
      <View style={styles.timeSummaryContainer}>
        <Text style={[styles.winnerText, isWinner && styles.winnerHighlight]}>
          {isWinner ? '🎉 You Won! 🎉' : `🎉 Winner: ${winner.user.name} 🎉`}
        </Text>
        <Text style={styles.timeSummaryText}>
          Your Score: {userPoints}/{challenge.totalPoints}
        </Text>
        {!isWinner && (
          <Text style={styles.winnerScoreText}>
            Winner's Score: {winnerPoints}/{challenge.totalPoints}
          </Text>
        )}
        <Text style={styles.timeSummaryText}>
          Your Time: {formatTime(userParticipant?.secondsCompleted || 0)}
        </Text>
        <Text style={styles.timeSummaryText}>
          Winner's Time: {formatTime(winner.secondsCompleted)}
        </Text>
      </View>
    );
  };

  const renderProgressBars = () => {
    if (!challenge) return null;

    return (
      <>
        <Text style={styles.leaderboardHeader}>Progress</Text>
        {sortedParticipants.map((p) => {
          const currentSeconds = secondsCompletedMap[p.user.id] ?? p.secondsCompleted;
          const percentCompleted = Math.round(getProgressPercent(currentSeconds));
          const isComplete = percentCompleted >= 100;
          const points = p.pointsEarned || calculatePoints(currentSeconds);

          return (
            <View key={`progress-${p.user.id}`} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.participantText, { marginBottom: 4 }]}>
                  {p.user.name || 'Anon'}
                  {isComplete && ' ✅'}
                </Text>
                <Text style={[styles.participantText, { marginBottom: 4 }]}>
                  {percentCompleted}% ({points} pts)
                </Text>
              </View>
              <View style={styles.individualProgressBarBackground}>
                <Animated.View
                  style={[
                    styles.individualProgressBarFill,
                    {
                      width: `${percentCompleted}%`,
                      backgroundColor: p.user.profileColor || '#00ffcc',
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </>
    );
  };

  const renderLeaderboard = () => {
    const rankEmojis = ['🥇', '🥈', '🥉'];
    
    return (
      <>
        <Text style={styles.leaderboardHeader}>Leaderboard</Text>
        {sortedParticipants.map((p, index) => {
          const secondsCompleted = secondsCompletedMap[p.user.id] ?? p.secondsCompleted;
          const points = p.pointsEarned || calculatePoints(secondsCompleted);
          const isComplete = getProgressPercent(secondsCompleted) >= 100;
          const isSelf = p.user.id === user?.id;
          
          return (
            <View key={`leaderboard-${p.user.id}-${index}`} style={[styles.participantRow, isSelf && styles.highlightRow]}>
              <View style={[styles.colorDot, { backgroundColor: p.user.profileColor || '#00ffcc' }]} />
              <Text style={styles.participantText}>
                {index < 3 ? rankEmojis[index] : `#${index + 1}`} {p.user.name || 'Anon'}: {formatTime(secondsCompleted)} ({points} pts)
                {isComplete && ' ✅'}
              </Text>
            </View>
          );
        })}
      </>
    );
  };

  const renderChallengeControls = () => {
    if (challenge?.status === 'Waiting' && creatorId === user?.id) {
      return (
        <TouchableOpacity onPress={handleStartChallenge} style={styles.activateButton}>
          <Text style={styles.activateButtonText}>Start Challenge</Text>
        </TouchableOpacity>
      );
    }

    if (challenge?.status === 'Active') {
      const userParticipant = challenge.participants.find(p => p.user.id === user?.id);
      const autoStarted = !!userParticipant?.currentSessionStart;
      const completed = userParticipant ? userParticipant.secondsCompleted >= totalDurationSeconds : false;

      if (!autoStarted && !completed) {
        return (
          <View style={styles.sessionButtonsContainer}>
            <TouchableOpacity
              onPress={handleStartSession}
              style={styles.sessionButton}
            >
              <Text style={styles.sessionButtonText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (autoStarted && !completed) {
        return (
          <View style={styles.sessionButtonsContainer}>
            <TouchableOpacity
              onPress={handleStopSession}
              style={styles.sessionButton}
            >
              <Text style={styles.sessionButtonText}>Stop Session</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Challenge not found.</Text>
      </View>
    );
  }

  const { dailyGoalSeconds, remainingDailySeconds } = calculateDailyGoal();
  const userProgressPercent = getProgressPercent(userTotalTime);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchChallenge();
          }}
          colors={['#00ffcc']}
          tintColor="#00ffcc"
        />
      }
    >
      <Text style={styles.title}>{challenge.title}</Text>
      {(typeof challenge.creator === 'object' ? challenge.creator._id : challenge.creator) === user?.id && (
  <TouchableOpacity
    style={styles.editButton}
    onPress={() => navigation.navigate('EditChallenge', { challenge })}
  >
    <Text style={styles.editButtonText}>✏️ Edit Challenge</Text>
  </TouchableOpacity>
)}

      
    

      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>
          {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
        </Text>
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>
          Goal: {challenge.totalHours}h in {challenge.durationDays} days
        </Text>
      </View>
      
      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>
          Points: {challenge.totalPoints}
        </Text>
        {remainingSeconds !== null && (
          <Text style={styles.subtitle}>
            Time left: {formatTime(remainingSeconds)}
          </Text>
        )}
      </View>

      {user?.id && (
        <View style={styles.userProgressContainer}>
          <Text style={styles.userProgressText}>
            Your Progress: {formatTime(userTotalTime)} ({userProgressPercent.toFixed(1)}%)
          </Text>
          {challenge.status === 'Active' && (
            <Text style={styles.dailyGoalText}>
              Daily Goal: {formatTime(remainingDailySeconds)} remaining
            </Text>
          )}
        </View>
      )}

      {renderChallengeControls()}
      {renderProgressBars()}
      {renderLeaderboard()}
      {renderTimeSummary()}

      {creatorId === user?.id && token && (
        <DeleteChallengeButton
          challengeId={challenge._id}
          token={token}
          onDeleted={() => navigation.goBack()}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e', padding: 16 },
  title: { fontFamily: 'PressStart2P', fontSize: 12, color: '#00ffcc', marginBottom: 8 },
  description: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#aaa',
    marginBottom: 12,
    lineHeight: 12,
  },
  hashtags: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#00ffcc',
    marginBottom: 16,
  },
  subtitle: { fontFamily: 'PressStart2P', fontSize: 8, color: '#ccc', marginBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userProgressContainer: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userProgressText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#00ffcc',
    marginBottom: 8,
  },
  dailyGoalText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ccc',
  },
  activateButton: { backgroundColor: '#00ffcc', padding: 10, borderRadius: 6, marginBottom: 20 },
  activateButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#000',
    textAlign: 'center',
  },
  sessionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  sessionButton: {
    flex: 1,
    backgroundColor: '#00ffcc',
    padding: 10,
    borderRadius: 6,
  },
  sessionButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#000',
    textAlign: 'center',
  },
  leaderboardHeader: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#00ffcc',
    marginBottom: 12,
    marginTop: 20,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 4,
  },
  highlightRow: {
    backgroundColor: '#1e1e1e',
    borderRadius: 6,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  participantText: { fontFamily: 'PressStart2P', fontSize: 8, color: '#fff' },
  individualProgressBarBackground: {
    height: 12,
    backgroundColor: '#222',
    borderRadius: 6,
    overflow: 'hidden',
  },
  individualProgressBarFill: { height: '100%', borderRadius: 6 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { fontFamily: 'PressStart2P', fontSize: 10, color: 'red' },
  timeSummaryContainer: {
    marginTop: 20,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
  },
  winnerText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  winnerHighlight: {
    color: '#00ffcc',
    fontSize: 14,
  },
  timeSummaryText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#00ffcc',
    marginBottom: 5,
  },
  winnerScoreText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#FFD700',
    marginBottom: 5,
  },
  editButton: {
  alignSelf: 'flex-end',
  backgroundColor: '#26dbc3',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
  marginBottom: 10,
},
editButtonText: {
  color: '#0e0e0e',
  fontWeight: '700',
  fontSize: 12,
},

});