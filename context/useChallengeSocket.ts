
// import axios from 'axios';
// import { useEffect } from 'react';
// import { useAuth } from './AuthContext';
// import { useSocket } from './SocketContext';
// import instance from '../api/AxiosInstance';

// export function useChallengeSocket(
//   challengeId: string | null,
//   onUpdate: (data: any) => void
// ) {
//   const { socket } = useSocket();
//   const { token, user } = useAuth(); // include user to send userId in socket payload

//   useEffect(() => {
//     if (!socket || !challengeId) return;

//     console.log('🔌 Joining challenge room:', challengeId);
//     socket.emit('join-challenge-room', challengeId);

//     const handleUpdate = (updatedChallenge: any) => {
//       console.log('📨 FE received challenge-updated:', updatedChallenge);
//       onUpdate(updatedChallenge);
//     };

//     socket.on('challenge-updated', handleUpdate);

//     return () => {
//       console.log('📤 Leaving challenge room:', challengeId);
//       socket.emit('leave-challenge-room', challengeId);
//       socket.off('challenge-updated', handleUpdate);
//     };
//   }, [socket, challengeId, onUpdate]);

//   return {
//     sendProgressUpdate: async () => {
//       if (!challengeId || !token || !user?.id) {
//         console.warn('⚠️ Missing challengeId, token, or user');
//         return;
//       }

//       if (socket?.connected) {
//         console.log('📡 Sending progress via socket...');
//         socket.emit('progress-update', {
//           challengeId,
//           userId: user.id,
//         });
//       } else {
//         console.log('🌐 Sending progress via HTTP (socket not connected)...');
//         try {
//           await axios.post(
//             `http://192.168.136.156:5000/api/challenges/${challengeId}/progress`,
//             {},
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//         } catch (err) {
//           console.error('❌ Error sending progress via HTTP:', err);
//         }
//       }
//     },
//   };
// }
import { useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import instance from '../api/AxiosInstance';

interface User {
  id: string;
  _id?: string;
  name: string;
  profileColor?: string;
}

export interface Participant {
  user: string | User;
  secondsCompleted: number;
  currentSessionStart?: string | null;
  pointsEarned?: number;
}

export interface ChallengeUpdate {
  _id: string;
  status: 'Waiting' | 'Active' | 'Completed';
  participants: Participant[];
  startDate?: string;
  endDate?: string;
  title?: string;
  totalHours?: number;
  durationDays?: number;
  totalPoints?: number;
  creator?: string | { _id: string; name?: string };
}

interface SessionEvent {
  userId: string;
  challengeId: string;
  startTime?: string;
  secondsAdded?: number;
  totalSeconds?: number;
}

export function useChallengeSocket(
  challengeId: string | null,
  onChallengeUpdate: (data: ChallengeUpdate) => void,
  onSessionStarted?: (data: SessionEvent) => void,
  onSessionStopped?: (data: SessionEvent) => void
) {
  const { socket } = useSocket();
  const { token, user } = useAuth();

  const handleChallengeUpdate = useCallback((updatedChallenge: ChallengeUpdate) => {
    console.log('📨 [Socket] Received challenge-updated:', updatedChallenge);
    
    const processedChallenge: ChallengeUpdate = {
      ...updatedChallenge,
      participants: updatedChallenge.participants.map((participant) => {
        if (typeof participant.user !== 'string') {
          return participant;
        }
        
        return {
          ...participant,
          user: {
            id: participant.user,
            _id: participant.user,
            name: 'Loading...',
            profileColor: '#cccccc'
          }
        };
      })
    };

    onChallengeUpdate(processedChallenge);
  }, [onChallengeUpdate]);

  useEffect(() => {
    if (!socket || !challengeId) return;

    console.log('🔌 [Socket] Joining challenge room:', challengeId);
    socket.emit('join-challenge-room', challengeId);

    socket.on('challenge-updated', handleChallengeUpdate);

    if (onSessionStarted) {
      socket.on('session-started', onSessionStarted);
    }

    if (onSessionStopped) {
      socket.on('session-stopped', onSessionStopped);
    }

    const handleError = (error: any) => {
      console.error('❌ [Socket] Error:', error);
    };

    socket.on('error', handleError);
    socket.on('connect_error', handleError);

    return () => {
      console.log('📤 [Socket] Leaving challenge room:', challengeId);
      socket.emit('leave-challenge-room', challengeId);
      socket.off('challenge-updated', handleChallengeUpdate);
      if (onSessionStarted) socket.off('session-started', onSessionStarted);
      if (onSessionStopped) socket.off('session-stopped', onSessionStopped);
      socket.off('error', handleError);
      socket.off('connect_error', handleError);
    };
  }, [socket, challengeId, handleChallengeUpdate, onSessionStarted, onSessionStopped]);

 const sendProgressUpdate = useCallback(async () => {
  if (!challengeId || !token || !user?.id) {
    console.warn('⚠️ Missing challengeId, token, or user');
    return;
  }

  const payload = {
    challengeId,
    userId: user.id,
    timestamp: Date.now(),
    sessionActive: true
  };

  try {
    if (socket?.connected) {
      console.log('📡 [Socket] Sending progress update:', payload);
      socket.emit('progress-update', payload);
    } else {
      console.log('🌐 [HTTP] Fallback - sending progress update');
      await instance.post(
        `/challenges/${challengeId}/progress`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  } catch (err) {
    console.error('❌ [Sync] Progress update failed:', err);
  }
}, [challengeId, token, user?.id, socket]);

  const sendSessionState = useCallback(async (action: 'start' | 'stop') => {
    if (!challengeId || !token || !user?.id) {
      console.warn('⚠️ Missing challengeId, token, or user');
      return;
    }

    const endpoint = `/challenges/${challengeId}/${action}`;
    const payload = { userId: user.id };

    try {
      const response = await instance.post(
        endpoint,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      console.error(`❌ [HTTP] Error ${action}ing session:`, err);
      throw err;
    }
  }, [challengeId, token, user?.id]);

  return {
    sendProgressUpdate,
    sendSessionState,
    isConnected: socket?.connected || false,
  };
}