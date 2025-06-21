import axios from 'axios';

const API_BASE = 'https://todo-backend-kfpi.onrender.com/api/todos'; // Replace with your actual URL

// --- Types ---
export interface Subtask {
  title: string;
  done: boolean;
}

export interface Todo {
  _id?: string;
  userId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done' | 'archived';
  tags?: string[];
  startTime?: string;
  endTime?: string;
  subtasks?: Subtask[];
  repeatInterval?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder?: string;
  isStarred?: boolean;
  assignedPoints?: number;
  category:string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodoFilters {
  status?: string;
  priority?: string;
  tag?: string;
  dueBefore?: string;
  dueAfter?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}

// --- API Helper ---
const authHeader = (token?: string) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

// --- API Functions ---

export const fetchTodos = async (filters: TodoFilters = {}, token?: string): Promise<Todo[]> => {
  const params = new URLSearchParams(filters as Record<string, string>).toString();
  const res = await axios.get(`${API_BASE}?${params}`, authHeader(token));
  return res.data;
};

export const createTodo = async (data: Todo, token: string): Promise<Todo> => {
  const res = await axios.post(API_BASE, data, authHeader(token));
  return res.data;
};

export const updateTodo = async (id: string, updates: Partial<Todo>, token: string): Promise<Todo> => {
  const res = await axios.put(`${API_BASE}/${id}`, updates, authHeader(token));
  return res.data;
};

export const deleteTodo = async (id: string, token: string): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_BASE}/${id}`, authHeader(token));
  return res.data;
};

export const syncTodos = async (sinceISO: string, token: string): Promise<Todo[]> => {
  const res = await axios.get(`${API_BASE}/sync?since=${encodeURIComponent(sinceISO)}`, authHeader(token));
  return res.data;
};

export const getTodoStats = async (token: string): Promise<{
  total: number;
  completed: number;
  completionRate: number;
  trend: { date: string; completed: number }[];
  earnedTodoPoints: number;
  totalAvailableTodoPoints: number;
}> => {
  const res = await axios.get(`${API_BASE}/stats`, authHeader(token));
  return res.data;
};

export const toggleSubtask = async (
  todoId: string,
  subtaskIndex: number,
  token: string
): Promise<Todo> => {
  const res = await axios.patch(`${API_BASE}/todos/${todoId}/subtasks/${subtaskIndex}`, {}, authHeader(token));
  return res.data;
};

export const getTodosByCalendarRange = async (
  from: string,
  to: string,
  token: string
): Promise<{ [date: string]: Todo[] }> => {
  const res = await axios.get(`https://todo-backend-kfpi.onrender.com/api/todos/calendar`, {
    params: { from, to },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

