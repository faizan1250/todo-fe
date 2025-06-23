// // api/axiosInstance.ts
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const instance = axios.create({
//   baseURL: 'http://192.168.153.156:5000/api', // Local IP
// });

// instance.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem('token');
//     if (token) {
//       config.headers = config.headers ?? {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Normalize header keys to lowercase to safely check content-type
//     const contentTypeHeaderKey = Object.keys(config.headers).find(
//       (key) => key.toLowerCase() === 'content-type'
//     );

//     const contentType = contentTypeHeaderKey
//       ? config.headers[contentTypeHeaderKey]
//       : undefined;

//     // If no content-type header is set AND data is NOT FormData, set JSON
//     if (!contentType && !(config.data instanceof FormData)) {
//       config.headers['Content-Type'] = 'application/json';
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default instance;


import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const instance = axios.create({
  baseURL: 'http://192.168.136.156:5000/api',
  // DO NOT set 'Content-Type' here globally
});



instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    config.headers = config.headers ?? {};

    // Find existing content-type header key (case-insensitive)
    const contentTypeKey = Object.keys(config.headers).find(
      (key) => key.toLowerCase() === 'content-type'
    );

    if (
      config.data &&
      !(config.data instanceof FormData) &&
      !contentTypeKey
    ) {
      config.headers['Content-Type'] = 'application/json';
    } else if (config.data instanceof FormData) {
      if (contentTypeKey) {
        delete config.headers[contentTypeKey];
      }
      // Let Axios handle Content-Type with proper boundary
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export default instance;
