import axios from 'axios';

const API_BASE = 'http://192.168.136.156:5000/api/todos'; // Replace with your actual URL

// --- Types ---
export interface Subtask {
  title: string;
  done: boolean;
}

// export interface Todo {
//   _id?: string;
//   userId?: string;
//   title: string;
//   description?: string;
//   dueDate?: string;
//   priority?: 'low' | 'medium' | 'high';
//   status?: 'todo' | 'in-progress' | 'done' | 'archived';
//   tags?: string[];
//   startTime?: string;
//   endTime?: string;
//   subtasks?: Subtask[];
//   repeatInterval?: 'none' | 'daily' | 'weekly' | 'monthly';
//   reminder?: string;
//   isStarred?: boolean;
//   assignedPoints?: number;
//   category:string;
//   createdAt?: string;
//   joinCode?: string;
//   updatedAt?: string;
// }
export interface Completion {
  userId: {
    _id: string;
    name: string;
  };
  completedAt: string;
  pointsEarned: number;
}

export interface Participant {
  _id: string;
  name: string;
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
  category: string;
  createdAt?: string;
  joinCode?: string;
  updatedAt?: string;
  participants?: Participant[];
  completions?: Completion[];
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

interface CreateTodoResponse {
  todo: Todo;
  joinCode?: string;
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

export const createTodo = async (data: Todo, token: string): Promise<{ todo: Todo; joinCode?: string }> => {
  const res = await axios.post(API_BASE, data, authHeader(token));
  return {
    todo: res.data,
    joinCode: res.data?.joinCode,
  };
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
  const res = await axios.get(`http://192.168.136.156:5000/api/todos/calendar`, {
    params: { from, to },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const joinTodoByCode = async (
  code: string,
  token: string
): Promise<{ message: string; todo: Todo }> => {
  const res = await axios.post(`${API_BASE}/join`, { code }, authHeader(token));
  return res.data;
};

export const fetchTodoDetails = async (todoId: string, token: string): Promise<Todo> => {
  const response = await axios.get(`${API_BASE}/${todoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// export const updateTodoStatus = async (
//   id: string, 
//   status: 'todo' | 'in-progress' | 'done' | 'archived',
//   token: string
// ): Promise<Todo> => {
//   const response = await axios.patch(
//     `${API_BASE}/${id}/status`,
//     { status },
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
//   return response.data;
// };
export const updateTodoStatus = async (
  id: string,
  status: 'todo' | 'in-progress' | 'done' | 'archived',
  token: string
): Promise<{ message: string; pointsEarned: number; todo: Todo }> => {
  const response = await axios.patch(`${API_BASE}/${id}/status`, { status }, authHeader(token));
  return response.data;
};

export const addParticipant = async (todoId: string, joinCode: string, token: string): Promise<Todo> => {
  const res = await axios.post(`${API_BASE}/${todoId}/participants`, { joinCode }, authHeader(token));
  return res.data;
};