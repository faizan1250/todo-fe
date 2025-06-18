// // context/AuthContext.tsx
// import React, { createContext, useState, useContext } from 'react';

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   nickname: string | null;
// };

// type AuthContextType = {
//   user: User | null;
//   token: string | null;
//   login: (token: string, user: User) => void;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   token: null,
//   login: () => {},
//   logout: () => {},
// });

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);

//   const login = (newToken: string, newUser: User) => {
//     setToken(newToken);
//     setUser(newUser);
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// context/AuthContext.tsx


import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  name: string;
  email: string;
  nickname: string | null;
  profilePicUrl?: string | null;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  token: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load auth from storage', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  // Login function saves token and user to state and AsyncStorage
  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
   
    try {
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to save auth data', error);
    }
  };

  // Logout clears state and AsyncStorage
  const logout = async () => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear auth data', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
