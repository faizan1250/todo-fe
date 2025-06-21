import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { getTodoStats } from '../../api/Todoapi';
import { useAuth } from '../../context/AuthContext';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { ProgressBar } from 'react-native-paper';

export default function TodoStats() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getTodoStats(token);
      setStats(data);
    } catch (err) {
      console.error('Stats fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading || !stats) {
    return <ActivityIndicator size="large" color="#26dbc3" style={{ marginTop: 30 }} />;
  }

  const completionPercent = stats.completionRate / 100;
  const trendData = stats.trend.map((point: any) => ({
    x: point.date.slice(5),
    y: point.completed
  }));

  const bestDay = stats.trend.reduce((best: any, current: any) => current.completed > (best.completed || 0) ? current : best, {});

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
    >
      <Text style={styles.title}>📊 Your Productivity</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completion Rate</Text>
        <ProgressBar progress={completionPercent} color="#26dbc3" style={styles.progressBar} />
        <Text style={styles.percentage}>{stats.completionRate}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Points</Text>
        <ProgressBar
          progress={stats.totalAvailableTodoPoints === 0 ? 0 : stats.earnedTodoPoints / stats.totalAvailableTodoPoints}
          color="#a78bfa"
          style={styles.progressBar}
        />
        <Text style={styles.percentage}>{stats.earnedTodoPoints} / {stats.totalAvailableTodoPoints} pts</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        <VictoryChart theme={VictoryTheme.material} domainPadding={16} animate={{ duration: 800 }}>
          <VictoryAxis style={{ tickLabels: { fill: '#fff', fontSize: 10 } }} />
          <VictoryAxis dependentAxis style={{ tickLabels: { fill: '#fff', fontSize: 10 } }} />
          <VictoryLine
            data={trendData}
            style={{ data: { stroke: '#26dbc3', strokeWidth: 2 } }}
            interpolation="monotoneX"
          />
        </VictoryChart>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Best Day</Text>
        <Text style={styles.percentage}>{bestDay?.date || 'N/A'} with {bestDay?.completed || 0} completions</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Current Streak</Text>
        <Text style={styles.percentage}>{stats.currentStreak || 0} days</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Longest Streak</Text>
        <Text style={styles.percentage}>{stats.longestStreak || 0} days</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📂 By Category</Text>
        {Object.entries(stats.categoryStats || {}).map(([cat, val]: any) => (
          <Text key={cat} style={styles.percentage}>
            {cat}: {val.completed} / {val.total} ✅
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 By Priority</Text>
        {Object.entries(stats.priorityStats || {}).map(([prio, val]: any) => (
          <Text key={prio} style={styles.percentage}>
            {prio.toUpperCase()}: {val.completed} / {val.total} ✅
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧠 Weekly Insight</Text>
        <Text style={styles.percentage}>{stats.suggestion || 'Keep going!'}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  percentage: {
    color: '#fff',
    fontSize: 14,
    marginTop: 6,
  },
});
