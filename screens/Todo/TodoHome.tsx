
// // screens/Todo/TodoHome.tsx
// import React, { useEffect, useState, useMemo, useRef } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
//   RefreshControl,
//   Modal,
//   ScrollView,
//   Animated,
//   Easing,
//   AppState,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Swipeable } from 'react-native-gesture-handler';
// import { fetchTodos, updateTodo, deleteTodo, getTodoStats, syncTodos } from '../../api/Todoapi';
// import { useAuth } from '../../context/AuthContext';
// import type { Todo } from '../../api/Todoapi';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { TodoStackParamList } from '../../navigation/TodoStackNavigator';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';



// const STATUS_TABS = ['All', 'Todo', 'In-Progress', 'Done', 'Archived'];
// const PRIORITY_COLORS = {
//   low: '#4ade80',
//   medium: '#facc15',
//   high: '#f87171',
// };

// export default function TodoHome() {
//   const navigation = useNavigation<NativeStackNavigationProp<TodoStackParamList>>();
//   const { token } = useAuth();
//   const [selectedTab, setSelectedTab] = useState('All');
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [todos, setTodos] = useState<Todo[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [stats, setStats] = useState({ earnedTodoPoints: 0, totalAvailableTodoPoints: 0 });
//   const [modalTodo, setModalTodo] = useState<Todo | null>(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const allCategories = useMemo(() => {
//     const unique = new Set(todos.map(t => t.category).filter(Boolean));
//     return Array.from(unique) as string[];
//   }, [todos]);

//   useEffect(() => {
//     restoreFilters();
//   }, []);

//   useEffect(() => {
//     loadTodos();
//     saveFilters();
//   }, [selectedTab, selectedCategory]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       backgroundSync();
//     }, 60000); // 1 minute
//     return () => clearInterval(interval);
//   }, []);

//   const restoreFilters = async () => {
//     const storedTab = await AsyncStorage.getItem('todoTab');
//     const storedCat = await AsyncStorage.getItem('todoCategory');
//     if (storedTab) setSelectedTab(storedTab);
//     if (storedCat) setSelectedCategory(storedCat);
//   };

//   const saveFilters = async () => {
//     await AsyncStorage.setItem('todoTab', selectedTab);
//     if (selectedCategory) {
//       await AsyncStorage.setItem('todoCategory', selectedCategory);
//     } else {
//       await AsyncStorage.removeItem('todoCategory');
//     }
//   };

//   const loadTodos = async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const statusParam = selectedTab !== 'All' ? selectedTab.toLowerCase() : '';
//       const data = await fetchTodos(statusParam ? { status: statusParam } : {}, token);
//       const stats = await getTodoStats(token);
//       setTodos(data);
//       setStats({
//         earnedTodoPoints: stats.earnedTodoPoints,
//         totalAvailableTodoPoints: stats.totalAvailableTodoPoints,
//       });
//       fadeAnim.setValue(0);
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 400,
//         useNativeDriver: true,
//         easing: Easing.out(Easing.ease),
//       }).start();
//     } catch (err) {
//       console.error('Failed to load todos', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

// const backgroundSync = async () => {
//   if (!token) return;
//   const lastSync = await AsyncStorage.getItem('lastSync');
//   const safeSyncTime = lastSync || new Date(0).toISOString(); // fallback to epoch
//   try {
//     const fresh = await syncTodos(safeSyncTime, token);
//     if (fresh.length > 0) {
//       await AsyncStorage.setItem('lastSync', new Date().toISOString());
//       loadTodos();
//     }
//   } catch (err) {
//     if (axios.isAxiosError(err)) {
//       console.error('Axios error:', err.response?.status, err.response?.data);
//     } else {
//       console.error('Unknown sync error:', err);
//     }
//   }
// };

//     const handleDelete = async (id: string) => {
//     if (!token) return;
//     try {
//       await deleteTodo(id, token);
//       loadTodos();
//     } catch (err) {
//       console.error('Failed to delete todo', err);
//     }
//   };

//   const handleLongPress = (id: string) => {
//     setSelectedIds(prev =>
//       prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
//     );
//   };
//     const pullToRefresh = async () => {
//     setRefreshing(true);
//     try {
//       const lastSync = await AsyncStorage.getItem('lastSync');
//       const newTodos = await syncTodos(lastSync || new Date(0).toISOString(), token!);
//       if (newTodos.length > 0) {
//         await loadTodos();
//       } else {
//         setRefreshing(false);
//       }
//     } catch (err) {
//       console.error('Sync failed', err);
//       setRefreshing(false);
//     }
//   };

//   const updateTodoStatus = async (status: 'todo' | 'in-progress' | 'done' | 'archived') => {
//     if (!modalTodo || !token) return;
//     await updateTodo(modalTodo._id!, { status }, token);
//     setModalTodo(null);
//     loadTodos();
//   };


//   const renderTodo = ({ item }: { item: Todo }) => (
//     <Animated.View style={{ opacity: fadeAnim }}>
//       <Swipeable
//         renderRightActions={() => (
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={() => handleDelete(item._id!)}
//           >
//             <Ionicons name="trash" size={24} color="white" />
//           </TouchableOpacity>
//         )}
//       >
//         <TouchableOpacity
//           onLongPress={() => handleLongPress(item._id!)}
//           onPress={() => setModalTodo(item)}
//           style={[styles.todoItem, selectedIds.includes(item._id!) && styles.selectedItem]}
//         >
//           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//             <Ionicons
//               name={item.status === 'done' ? 'checkbox' : 'square-outline'}
//               size={20}
//               color="#26dbc3"
//               style={{ marginRight: 10 }}
//             />
//             <View>
//               <Text style={styles.todoTitle}>{item.title}</Text>
//               <Text style={styles.todoMeta}>
//                 {item.startTime ? `${new Date(item.startTime).toLocaleTimeString()} - ` : ''}
//                 {item.endTime ? new Date(item.endTime).toLocaleTimeString() : '—'}
//               </Text>
//               <Text style={styles.todoMeta}>{item.category || 'No category'}</Text>
//             </View>
//           </View>
//           <View style={styles.todoRight}>
//             <Text style={[styles.priority, { color: PRIORITY_COLORS[item.priority || 'low'] }]}>
//               {item.priority?.toUpperCase() || '—'}
//             </Text>
//             {item.isStarred && <Ionicons name="star" color="gold" size={16} />}
//           </View>
//         </TouchableOpacity>
//       </Swipeable>
//     </Animated.View>
//   );



//   ///

//   const batchDelete = async () => {
//     if (!token || selectedIds.length === 0) return;
//     try {
//       await Promise.all(selectedIds.map(id => deleteTodo(id, token)));
//       setSelectedIds([]);
//       loadTodos();
//     } catch (err) {
//       Alert.alert('Failed to delete some tasks');
//     }
//   };

//   const filteredTodos = useMemo(() => {
//     return selectedCategory ? todos.filter(t => t.category === selectedCategory) : todos;
//   }, [todos, selectedCategory]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.tabRow}>
//         {STATUS_TABS.map(tab => (
//           <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
//             <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
// // Replace the existing ScrollView for categories with this:
// <ScrollView
//   horizontal
//   showsHorizontalScrollIndicator={false}
//   style={styles.categoryRow}
//   contentContainerStyle={styles.categoryRowContent}
// >
//   <TouchableOpacity
//     onPress={() => setSelectedCategory(null)}
//     style={[
//       styles.categoryChip,
//       !selectedCategory && styles.selectedChip,
//     ]}
//   >
//     <Text style={[styles.categoryText, !selectedCategory && styles.selectedCategoryText]}>
//       All
//     </Text>
//   </TouchableOpacity>
  
//   {allCategories.map(cat => (
//     <TouchableOpacity
//       key={cat}
//       onPress={() => setSelectedCategory(cat)}
//       style={[
//         styles.categoryChip,
//         selectedCategory === cat && styles.selectedChip,
//       ]}
//     >
//       <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedCategoryText]}>
//         {cat}
//       </Text>
//     </TouchableOpacity>
//   ))}
// </ScrollView>



//       <View style={styles.pointsBar}>
//         <Text style={{ color: '#fff', fontWeight: '500' }}>
//           Points: {stats.earnedTodoPoints} / {stats.totalAvailableTodoPoints}
//         </Text>
//       </View>

//       {selectedIds.length > 0 && (
//         <TouchableOpacity style={styles.batchDeleteBar} onPress={batchDelete}>
//           <Text style={{ color: '#fff' }}>Delete Selected ({selectedIds.length})</Text>
//         </TouchableOpacity>
//       )}

//       {loading ? (
//         <ActivityIndicator color="#26dbc3" size="large" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={filteredTodos}
//           keyExtractor={item => item._id!}
//           renderItem={renderTodo}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={pullToRefresh} colors={["#26dbc3"]} />
//           }
//         />
//       )}

//       <TouchableOpacity
//         onPress={() => navigation.navigate('CreateTodo')}
//         style={styles.fab}
//       >
//         <Ionicons name="add" size={28} color="black" />
//       </TouchableOpacity>

//       <Modal visible={!!modalTodo} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <ScrollView>
//               <Text style={styles.modalTitle}>{modalTodo?.title}</Text>
//               <Text style={styles.todoMeta}>{modalTodo?.description}</Text>
//               <Text style={styles.todoMeta}>Priority: {modalTodo?.priority || 'None'}</Text>
//               <Text style={styles.todoMeta}>Start: {modalTodo?.startTime ? new Date(modalTodo.startTime).toLocaleString() : 'None'}</Text>
//               <Text style={styles.todoMeta}>End: {modalTodo?.endTime ? new Date(modalTodo.endTime).toLocaleString() : 'None'}</Text>
//               <Text style={styles.todoMeta}>Category: {modalTodo?.category || 'None'}</Text>
//               <Text style={styles.todoMeta}>Points: {modalTodo?.assignedPoints}</Text>

//               <View style={{ marginTop: 16 }}>
//                 <Text style={[styles.todoMeta, { marginBottom: 8 }]}>Change Status:</Text>
//                 {['todo', 'in-progress', 'done', 'archived'].map(status => (
//                   <TouchableOpacity
//                     key={status}
//                     onPress={() => updateTodoStatus(status as any)}
//                     style={[styles.completeBtn, { backgroundColor: '#333', marginBottom: 8 }]}
//                   >
//                     <Text style={{ color: '#fff' }}>{status.toUpperCase()}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <TouchableOpacity onPress={() => setModalTodo(null)}>
//                 <Text style={{ color: '#f87171', textAlign: 'center', marginTop: 20 }}>Close</Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000' },
//   tabRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12 },
//   tabText: { color: '#888', fontSize: 14 },
//   activeTabText: { color: '#26dbc3', textDecorationLine: 'underline' },
//   pointsBar: { alignItems: 'center', paddingVertical: 8, backgroundColor: '#121212' },
//   todoItem: {
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//     padding: 16, borderBottomWidth: 1, borderBottomColor: '#333',
//   },
//   selectedItem: { backgroundColor: '#1a1a1a' },
//   todoTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   todoMeta: { color: '#aaa', fontSize: 12, marginTop: 4 },
//   todoRight: { alignItems: 'flex-end' },
//   priority: { fontWeight: 'bold', fontSize: 12 },
//   deleteButton: { backgroundColor: '#f87171', justifyContent: 'center', alignItems: 'center', width: 64 },
//   fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#26dbc3', padding: 16, borderRadius: 32, elevation: 5 },
//   batchDeleteBar: { backgroundColor: '#f87171', paddingVertical: 10, alignItems: 'center' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
//   modalContent: { backgroundColor: '#1e1e1e', borderRadius: 12, padding: 20 },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
//   completeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#26dbc3', padding: 12, borderRadius: 8 },
//   categoryRow: {
//     flexDirection: 'row',
//     paddingVertical: 6,
//     backgroundColor: '#000',
//   },
//   categoryRowContent: {
//     paddingHorizontal: 10,
//   },
//   categoryChip: {
//     borderColor: '#444',
//     borderWidth: 1,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 16,
//     marginRight: 6,
//     height: 30,
//     justifyContent: 'center',
//   },
//   selectedChip: {
//     backgroundColor: '#26dbc3',
//     borderColor: '#26dbc3',
//   },
//   categoryText: {
//     color: '#aaa',
//     fontSize: 12,
//   },
//   selectedCategoryText: {
//     color: '#000',
//   },


// });
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { fetchTodos, updateTodo, deleteTodo, getTodoStats, syncTodos } from '../../api/Todoapi';
import { useAuth } from '../../context/AuthContext';
import type { Todo } from '../../api/Todoapi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TodoStackParamList } from '../../navigation/TodoStackNavigator';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const STATUS_TABS = ['All', 'Todo', 'In-Progress', 'Done', 'Archived'];
const PRIORITY_COLORS = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#f87171',
};

export default function TodoHome() {
  const navigation = useNavigation<NativeStackNavigationProp<TodoStackParamList>>();
  const { token } = useAuth();
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ earnedTodoPoints: 0, totalAvailableTodoPoints: 0 });
  const [modalTodo, setModalTodo] = useState<Todo | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const allCategories = useMemo(() => {
    const unique = new Set(todos.map(t => t.category).filter(Boolean));
    return Array.from(unique) as string[];
  }, [todos]);

  useEffect(() => {
    restoreFilters();
  }, []);

  useEffect(() => {
    loadTodos();
    saveFilters();
  }, [selectedTab, selectedCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      backgroundSync();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const restoreFilters = async () => {
    const storedTab = await AsyncStorage.getItem('todoTab');
    const storedCat = await AsyncStorage.getItem('todoCategory');
    if (storedTab) setSelectedTab(storedTab);
    if (storedCat) setSelectedCategory(storedCat);
  };

  const saveFilters = async () => {
    await AsyncStorage.setItem('todoTab', selectedTab);
    if (selectedCategory) {
      await AsyncStorage.setItem('todoCategory', selectedCategory);
    } else {
      await AsyncStorage.removeItem('todoCategory');
    }
  };

  const loadTodos = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = selectedTab !== 'All' ? selectedTab.toLowerCase() : '';
      const data = await fetchTodos(statusParam ? { status: statusParam } : {}, token);
      const stats = await getTodoStats(token);
      setTodos(data);
      setStats({
        earnedTodoPoints: stats.earnedTodoPoints,
        totalAvailableTodoPoints: stats.totalAvailableTodoPoints,
      });
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } catch (err) {
      console.error('Failed to load todos', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const backgroundSync = async () => {
    if (!token) return;
    const lastSync = await AsyncStorage.getItem('lastSync');
    const safeSyncTime = lastSync || new Date(0).toISOString();
    try {
      const fresh = await syncTodos(safeSyncTime, token);
      if (fresh.length > 0) {
        await AsyncStorage.setItem('lastSync', new Date().toISOString());
        loadTodos();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Axios error:', err.response?.status, err.response?.data);
      } else {
        console.error('Unknown sync error:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteTodo(id, token);
      loadTodos();
    } catch (err) {
      console.error('Failed to delete todo', err);
    }
  };

  const handleLongPress = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const pullToRefresh = async () => {
    setRefreshing(true);
    try {
      const lastSync = await AsyncStorage.getItem('lastSync');
      const newTodos = await syncTodos(lastSync || new Date(0).toISOString(), token!);
      if (newTodos.length > 0) {
        await loadTodos();
      } else {
        setRefreshing(false);
      }
    } catch (err) {
      console.error('Sync failed', err);
      setRefreshing(false);
    }
  };

  const updateTodoStatus = async (status: 'todo' | 'in-progress' | 'done' | 'archived') => {
    if (!modalTodo || !token) return;
    await updateTodo(modalTodo._id!, { status }, token);
    setModalTodo(null);
    loadTodos();
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Swipeable
        renderRightActions={() => (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id!)}
          >
            <Ionicons name="trash" size={24} color="white" />
          </TouchableOpacity>
        )}
      >
        <TouchableOpacity
          onLongPress={() => handleLongPress(item._id!)}
          onPress={() => setModalTodo(item)}
          style={[styles.todoItem, selectedIds.includes(item._id!) && styles.selectedItem]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={item.status === 'done' ? 'checkbox' : 'square-outline'}
              size={20}
              color="#26dbc3"
              style={{ marginRight: 10 }}
            />
            <View>
              <Text style={styles.todoTitle}>{item.title}</Text>
              <Text style={styles.todoMeta}>
                {item.startTime ? `${new Date(item.startTime).toLocaleTimeString()} - ` : ''}
                {item.endTime ? new Date(item.endTime).toLocaleTimeString() : '—'}
              </Text>
              <Text style={styles.todoMeta}>{item.category || 'No category'}</Text>
            </View>
          </View>
          <View style={styles.todoRight}>
            <Text style={[styles.priority, { color: PRIORITY_COLORS[item.priority || 'low'] }]}>
              {item.priority?.toUpperCase() || '—'}
            </Text>
            {item.isStarred && <Ionicons name="star" color="gold" size={16} />}
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );

  const batchDelete = async () => {
    if (!token || selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => deleteTodo(id, token)));
      setSelectedIds([]);
      loadTodos();
    } catch (err) {
      Alert.alert('Failed to delete some tasks');
    }
  };

  const filteredTodos = useMemo(() => {
    return selectedCategory ? todos.filter(t => t.category === selectedCategory) : todos;
  }, [todos, selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {STATUS_TABS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
          contentContainerStyle={styles.categoryRowContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.categoryChip,
              !selectedCategory && styles.selectedChip,
            ]}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.selectedCategoryText]}>
              All
            </Text>
          </TouchableOpacity>
          
          {allCategories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.selectedChip,
              ]}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedCategoryText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            style={styles.addCategoryChip}
          >
            <Ionicons name="add" size={16} color="#26dbc3" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.pointsBar}>
        <Text style={{ color: '#fff', fontWeight: '500' }}>
          Points: {stats.earnedTodoPoints} / {stats.totalAvailableTodoPoints}
        </Text>
      </View>

      {selectedIds.length > 0 && (
        <TouchableOpacity style={styles.batchDeleteBar} onPress={batchDelete}>
          <Text style={{ color: '#fff' }}>Delete Selected ({selectedIds.length})</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator color="#26dbc3" size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredTodos}
          keyExtractor={item => item._id!}
          renderItem={renderTodo}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={pullToRefresh} colors={["#26dbc3"]} />
          }
        />
      )}

      <Modal visible={!!modalTodo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{modalTodo?.title}</Text>
              <Text style={styles.todoMeta}>{modalTodo?.description}</Text>
              <Text style={styles.todoMeta}>Priority: {modalTodo?.priority || 'None'}</Text>
              <Text style={styles.todoMeta}>Start: {modalTodo?.startTime ? new Date(modalTodo.startTime).toLocaleString() : 'None'}</Text>
              <Text style={styles.todoMeta}>End: {modalTodo?.endTime ? new Date(modalTodo.endTime).toLocaleString() : 'None'}</Text>
              <Text style={styles.todoMeta}>Category: {modalTodo?.category || 'None'}</Text>
              <Text style={styles.todoMeta}>Points: {modalTodo?.assignedPoints}</Text>

              <View style={{ marginTop: 16 }}>
                <Text style={[styles.todoMeta, { marginBottom: 8 }]}>Change Status:</Text>
                {['todo', 'in-progress', 'done', 'archived'].map(status => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => updateTodoStatus(status as any)}
                    style={[styles.completeBtn, { backgroundColor: '#333', marginBottom: 8 }]}
                  >
                    <Text style={{ color: '#fff' }}>{status.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => setModalTodo(null)}>
                <Text style={{ color: '#f87171', textAlign: 'center', marginTop: 20 }}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.categoryModalOverlay}>
          <View style={styles.categoryModalContent}>
            <Text style={styles.categoryModalTitle}>Select Category</Text>
            {allCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setShowCategoryModal(false);
                }}
                style={styles.categoryModalItem}
              >
                <Text style={styles.categoryModalText}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              onPress={() => setShowCategoryModal(false)}
              style={styles.categoryModalClose}
            >
              <Text style={{ color: '#f87171' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  tabRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  tabText: { color: '#888', fontSize: 14 },
  activeTabText: { color: '#26dbc3', textDecorationLine: 'underline' },
  pointsBar: { 
    alignItems: 'center', 
    paddingVertical: 8, 
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  todoItem: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333',
  },
  selectedItem: { backgroundColor: '#1a1a1a' },
  todoTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  todoMeta: { color: '#aaa', fontSize: 12, marginTop: 4 },
  todoRight: { alignItems: 'flex-end' },
  priority: { fontWeight: 'bold', fontSize: 12 },
  deleteButton: { 
    backgroundColor: '#f87171', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 64 
  },
  batchDeleteBar: { 
    backgroundColor: '#f87171', 
    paddingVertical: 10, 
    alignItems: 'center' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    padding: 24 
  },
  modalContent: { 
    backgroundColor: '#1e1e1e', 
    borderRadius: 12, 
    padding: 20 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 12 
  },
  completeBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#26dbc3', 
    padding: 12, 
    borderRadius: 8 
  },
  categoryContainer: {
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  categoryRowContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  categoryChip: {
    borderColor: '#444',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    height: 30,
    justifyContent: 'center',
  },
  addCategoryChip: {
    borderColor: '#26dbc3',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#26dbc3',
    borderColor: '#26dbc3',
  },
  categoryText: {
    color: '#aaa',
    fontSize: 12,
  },
  selectedCategoryText: {
    color: '#000',
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  categoryModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryModalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  categoryModalText: {
    color: '#fff',
    fontSize: 16,
  },
  categoryModalClose: {
    marginTop: 16,
    padding: 10,
    alignItems: 'center',
  },
});