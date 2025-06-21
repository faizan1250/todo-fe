import React, { useEffect, useState } from 'react';
import { View, Text, Modal, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { getTodosByCalendarRange } from '../../api/Todoapi';
import { Todo } from '../../api/Todoapi';
import { Ionicons } from '@expo/vector-icons';
import TodoFilterBar from '../../components/TodoFilter';
export default function TodoCalendar() {
  const { token } = useAuth();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [allTodos, setAllTodos] = useState<{ [key: string]: Todo[] }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [weekView, setWeekView] = useState(false);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<{ [key: string]: number }>({});
 const [selectedTag, setSelectedTag] = useState<string>('All');

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    loadCalendarTodos(start.toISOString(), end.toISOString());
  }, []);

  const loadCalendarTodos = async (from: string, to: string) => {
    if (!token) return;
    try {
      const grouped = await getTodosByCalendarRange(from, to, token);
      setAllTodos(grouped);

      const all = Object.values(grouped).flat();
      const cats = Array.from(new Set(all.map(t => t.category).filter(Boolean)));
      setCategories(['All', ...cats]);

      const totalPoints = all.reduce((acc, t) => acc + (t.assignedPoints || 0), 0);
      setMonthlyPoints(totalPoints);

      // 📈 Weekly productivity (done todos in last 7 days)
      const now = new Date();
      const trend: { [key: string]: number } = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        trend[key] = all.filter(todo => todo.status === 'done' && todo.updatedAt?.startsWith(key)).length;
      }
      setWeeklyStats(trend);

      updateMarkedDates(grouped, selectedCategory);
    } catch (err) {
      console.error('Failed to fetch calendar todos', err);
    }
  };

  const updateMarkedDates = (grouped: { [key: string]: Todo[] }, filter: string) => {
    const markings: any = {};
    const today = new Date();

    Object.entries(grouped).forEach(([date, todos]: [string, Todo[]]) => {
      const filteredTodos = filter === 'All' ? todos : todos.filter(t => t.category === filter);
      if (filteredTodos.length === 0) return;

      const dotColors = filteredTodos.map(todo => getStatusColor(todo.status || 'todo'));
      const uniqueDots = Array.from(new Set(dotColors)).map((color, index) => ({
        key: `dot-${index}`,
        color
      }));

      const intensity = Math.min(filteredTodos.length, 5);
      const backgroundColor = `rgba(38, 219, 195, ${0.15 + intensity * 0.15})`;

      const hasReminder = filteredTodos.some(t => !!t.reminder);
      const hasStar = filteredTodos.some(t => t.isStarred);
      const isOverdue = filteredTodos.some(t => new Date(t.endTime || t.startTime || '') < today && t.status !== 'done');

      markings[date] = {
        customStyles: {
          container: {
            backgroundColor: isOverdue ? '#dc2626' : backgroundColor,
            borderRadius: 6,
          },
          text: {
            color: hasReminder ? '#facc15' : '#fff',
            fontWeight: hasStar ? 'bold' : 'normal',
          }
        },
        dots: uniqueDots
      };
    });
    setMarkedDates(markings);
  };


  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const all = allTodos[day.dateString] || [];
    const filtered = selectedCategory === 'All' ? all : all.filter(t => t.category === selectedCategory);
    setTodos(filtered);
    setModalVisible(true);
  };

  const formatTime = (time?: string | Date) => {
    if (!time) return '';
    const d = typeof time === 'string' ? new Date(time) : time;
    return d.toISOString().slice(11, 16);
  };
 

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={styles.headerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.selectedChip]}
              onPress={() => {
                setSelectedCategory(cat);
                updateMarkedDates(allTodos, cat);
              }}
            >
              <Text style={{ color: selectedCategory === cat ? '#000' : '#aaa', fontSize: 12 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={() => setWeekView(prev => !prev)}>
          <Text style={styles.toggleBtn}>{weekView ? '📅 Month' : '📆 Week'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.summaryText}>📊 This month's assigned points: {monthlyPoints}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weeklyTrend}>
        {Object.entries(weeklyStats).map(([date, count]) => (
          <View key={date} style={styles.trendBar}>
            <Text style={styles.trendCount}>{count}</Text>
            <Text style={styles.trendLabel}>{date.slice(5)}</Text>
          </View>
        ))}
      </ScrollView>
 
      <CalendarList
        onDayPress={onDayPress}
        pastScrollRange={weekView ? 0 : 12}
        futureScrollRange={weekView ? 0 : 12}
        markingType="custom"
        markedDates={markedDates}
        horizontal
        pagingEnabled={weekView}
        calendarWidth={weekView ? 360 : undefined}
        theme={{
          calendarBackground: '#000',
          dayTextColor: '#fff',
          monthTextColor: '#26dbc3',
          todayTextColor: '#facc15',
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDate}</Text>

            {todos.length === 0 ? (
              <Text style={styles.noTasksText}>No tasks for this day.</Text>
            ) : (
              <FlatList
                data={todos}
                keyExtractor={item => item._id!}
                renderItem={({ item }) => (
                  <View style={styles.todoItem}>
                    <Ionicons
                      name={item.status === 'done' ? 'checkbox' : 'square-outline'}
                      size={20}
                      color="#26dbc3"
                      style={{ marginRight: 10 }}
                    />
                    <View>
                      <Text style={styles.todoTitle}>{item.title} {item.isStarred && '⭐'}</Text>
                      <Text style={[styles.todoMeta, item.reminder ? { color: '#facc15' } : {}]}>
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        {item.category ? ` • ${item.category}` : ''}
                        {item.repeatInterval !== 'none' ? ` • 🔁 ${item.repeatInterval}` : ''}
                        {item.assignedPoints ? ` • ${item.assignedPoints} pts` : ''}
                        {item.reminder ? ' • ⏰' : ''}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#f87171', textAlign: 'center', marginTop: 20 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'todo': return '#4ade80';
    case 'in-progress': return '#facc15';
    case 'done': return '#60a5fa';
    case 'archived': return '#9ca3af';
    default: return '#fff';
  }
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noTasksText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  todoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  todoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoMeta: {
    color: '#aaa',
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  categoryChip: {
    borderColor: '#444',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
  },
  selectedChip: {
    backgroundColor: '#26dbc3',
    borderColor: '#26dbc3',
  },
  toggleBtn: {
    color: '#26dbc3',
    padding: 6,
    fontWeight: '600',
    fontSize: 13,
  },
  summaryText: {
    color: '#aaa',
    fontSize: 13,
    marginHorizontal: 10,
    marginBottom: 4,
  },
  weeklyTrend: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  trendBar: {
    alignItems: 'center',
    marginRight: 12,
  },
  trendCount: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendLabel: {
    color: '#888',
    fontSize: 10,
  },
});
