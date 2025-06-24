
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Share,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchTodoDetails, 
  updateTodoStatus as apiUpdateTodoStatus, 
  addParticipant as apiAddParticipant 
} from '../../api/Todoapi';
import type { Todo, Participant, Completion } from '../../api/Todoapi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TodoStackParamList } from '../../navigation/TodoStackNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import Avatar from '../../components/Avatar';

type RouteParams = {
  todoId: string;
};

const PRIORITY_COLORS = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#f87171',
};

const STATUS_OPTIONS = [
  { value: 'todo' as const, label: 'To Do', icon: 'checkbox-outline' as const },
  { value: 'in-progress' as const, label: 'In Progress', icon: 'time-outline' as const },
  { value: 'done' as const, label: 'Done', icon: 'checkmark-done-outline' as const },
  { value: 'archived' as const, label: 'Archived', icon: 'archive-outline' as const },
];
export default function TodoDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TodoStackParamList>>();
  const { token, user } = useAuth();
  const route = useRoute();
  const { todoId } = route.params as RouteParams;
  
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  useEffect(() => {
    loadTodoDetails();
  }, [todoId]);

  const loadTodoDetails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchTodoDetails(todoId, token);
      setTodo(data);
    } catch (err) {
      console.error('Failed to load todo details', err);
      Alert.alert('Error', 'Failed to load todo details');
    } finally {
      setLoading(false);
    }
  };

//   const handleStatusChange = async (status: 'todo' | 'in-progress' | 'done' | 'archived') => {
//     if (!token || !todo) return;
//     try {
//       await apiUpdateTodoStatus(todo._id!, status, token);
//       setTodo({ ...todo, status });
//       Alert.alert('Success', 'Status updated!');
//     } catch (err) {
//       console.error('Failed to update status', err);
//       Alert.alert('Error', 'Failed to update status');
//     }
//   };
const handleStatusChange = async (status: 'todo' | 'in-progress' | 'done' | 'archived') => {
  if (!token || !todo) return;
  try {
    const updatedTodo = await apiUpdateTodoStatus(todo._id!, status, token);
    setTodo(updatedTodo);
    
    // Show success message only after state updates
    if (status === 'done') {
      Alert.alert('Success', `Task completed! +${todo.assignedPoints || 0} points`);
    } else {
      Alert.alert('Success', 'Status updated!');
    }
  } catch (err) {
    console.error('Failed to update status', err);
    Alert.alert('Error', 'Failed to update status');
  }
};
  const handleJoinTodo = async () => {
    if (!token || !joinCodeInput) return;
    setJoining(true);
    try {
      await apiAddParticipant(todoId, joinCodeInput, token);
      Alert.alert('Success', 'You have joined this todo!');
      loadTodoDetails();
    } catch (err) {
      console.error('Failed to join todo', err);
      Alert.alert('Error', 'Failed to join todo. Invalid code or already a participant.');
    } finally {
      setJoining(false);
      setJoinCodeInput('');
    }
  };

  const handleShare = async () => {
    if (!todo?.joinCode) return;
    try {
      await Share.share({
        message: `Join my todo "${todo.title}"! Use code: ${todo.joinCode}`,
      });
    } catch (err) {
      console.error('Failed to share', err);
    }
  };

  if (loading || !todo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#26dbc3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{todo.title}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[todo.priority || 'medium'] }]}>
            <Text style={styles.priorityText}>{todo.priority?.toUpperCase() || 'MEDIUM'}</Text>
          </View>
          {todo.isStarred && <Ionicons name="star" color="gold" size={20} />}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{todo.description || 'No description'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color="#26dbc3" />
          <Text style={styles.detailText}>
            {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color="#26dbc3" />
          <Text style={styles.detailText}>
            {todo.startTime ? new Date(todo.startTime).toLocaleTimeString() : 'No start time'} - 
            {todo.endTime ? new Date(todo.endTime).toLocaleTimeString() : 'No end time'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="pricetag-outline" size={20} color="#26dbc3" />
          <Text style={styles.detailText}>{todo.category || 'No category'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="trophy-outline" size={20} color="#26dbc3" />
          <Text style={styles.detailText}>Points: {todo.assignedPoints || 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusContainer}>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusOption,
                todo.status === option.value && styles.statusOptionActive
              ]}
              onPress={() => handleStatusChange(option.value)}
            >
              <Ionicons 
                name={option.icon} 
                size={20} 
                color={todo.status === option.value ? '#26dbc3' : '#888'} 
              />
              <Text style={[
                styles.statusText,
                todo.status === option.value && styles.statusTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {todo.subtasks && todo.subtasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subtasks</Text>
          {todo.subtasks.map((subtask, index) => (
            <View key={index} style={styles.subtask}>
              <Ionicons 
                name={subtask.done ? 'checkbox' : 'square-outline'} 
                size={20} 
                color="#26dbc3" 
              />
              <Text style={[styles.subtaskText, subtask.done && styles.subtaskDone]}>
                {subtask.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants ({todo.participants?.length || 0})</Text>
        <View style={styles.participantsContainer}>
          {todo.participants?.map((participant: any) => (
            <View key={participant._id} style={styles.participant}>
             <Avatar name={participant?.name || 'U'} size={40} />
              <Text style={styles.participantName}>{participant.name}</Text>
              {participant._id === todo.userId && (
                <Ionicons name="ribbon" size={16} color="gold" style={styles.creatorBadge} />
              )}
            </View>
          ))}
        </View>

        {todo.joinCode && !todo.participants?.some(p => p._id === user?.id) && (
          <View style={styles.joinContainer}>
            <Text style={styles.joinTitle}>Join this todo</Text>
            <View style={styles.joinInputContainer}>
              <Ionicons name="key-outline" size={20} color="#26dbc3" />
              <TextInput
                style={styles.joinInput}
                placeholder="Enter join code"
                value={joinCodeInput}
                onChangeText={setJoinCodeInput}
                placeholderTextColor="#888"
              />
            </View>
            <TouchableOpacity 
              style={styles.joinButton} 
              onPress={handleJoinTodo}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.joinButtonText}>Join</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {todo.joinCode && todo.participants?.some(p => p._id === user?.id) && (
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#26dbc3" />
            <Text style={styles.shareButtonText}>Share with others</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completion History</Text>
        {todo.completions && todo.completions.length > 0 ? (
          todo.completions.map((completion: any, index: number) => (
            <View key={index} style={styles.completionItem}>
              <Text style={styles.completionUser}>
  {completion?.userId?.name || 'Unknown'}
</Text>
              <Text style={styles.completionDate}>
                {new Date(completion.completedAt).toLocaleDateString()}
              </Text>
              <Text style={styles.completionPoints}>+{completion.pointsEarned} points</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noCompletions}>No completion history yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#26dbc3',
    marginBottom: 12,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    width: '23%',
  },
  statusOptionActive: {
    backgroundColor: '#1a1a1a',
  },
  statusText: {
    color: '#888',
    marginTop: 4,
    fontSize: 12,
  },
  statusTextActive: {
    color: '#26dbc3',
  },
  subtask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 4,
  },
  subtaskText: {
    color: '#fff',
    fontSize: 16,
  },
  subtaskDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  participant: {
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  participantName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  creatorBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  joinContainer: {
    marginTop: 16,
  },
  joinTitle: {
    color: '#fff',
    marginBottom: 8,
  },
  joinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  joinInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 8,
  },
  joinButton: {
    backgroundColor: '#26dbc3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  shareButtonText: {
    color: '#26dbc3',
    fontWeight: 'bold',
  },
  completionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  completionUser: {
    color: '#fff',
    flex: 2,
  },
  completionDate: {
    color: '#aaa',
    flex: 1,
    textAlign: 'center',
  },
  completionPoints: {
    color: '#4ade80',
    flex: 1,
    textAlign: 'right',
  },
  noCompletions: {
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
});
