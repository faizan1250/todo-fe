// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import axiosInstance from '../api/AxiosInstance';
// import { useFonts } from 'expo-font';

// export default function RegisterScreen({ navigation }: any) {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleRegister = async () => {
//     try {
//       await axiosInstance.post('/auth/register', { name, email, password });
//       alert('Registration successful!');
//       navigation.navigate('Login');
//     } catch (err: any) {
//       console.log('Axios error response:', err.response?.data);
//       alert(err.response?.data?.message || 'Registration failed');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Register</Text>

//       <TextInput
//         placeholder="Name"
//         placeholderTextColor="#aaa"
//         value={name}
//         onChangeText={setName}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Email"
//         placeholderTextColor="#aaa"
//         value={email}
//         onChangeText={setEmail}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Password"
//         placeholderTextColor="#aaa"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleRegister}>
//         <Text style={styles.buttonText}>SIGN UP</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0e0e0e',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   title: {
//     fontFamily: 'PressStart2P',
//     fontSize: 18,
//     color: '#ffffff',
//     marginBottom: 24,
//   },
//   input: {
//     width: '100%',
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#ffffff',
//     borderColor: '#00ffcc',
//     borderWidth: 1,
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 12,
//     backgroundColor: '#1a1a1a',
//   },
//   button: {
//     backgroundColor: '#00ffcc',
//     padding: 14,
//     width: '100%',
//     alignItems: 'center',
//     borderRadius: 6,
//     marginTop: 12,
//   },
//   buttonText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#0e0e0e',
//   },
// });

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
// } from 'react-native';
// import axiosInstance from '../api/AxiosInstance';
// import * as ImagePicker from 'expo-image-picker';
// import { useFonts } from 'expo-font';

// export default function RegisterScreen({ navigation }: any) {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [image, setImage] = useState<string | null>(null);

//   const [fontsLoaded] = useFonts({
//     'PressStart2P': require('../assets/fonts/PressStart2P-Regular.ttf'),
//   });

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.5,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const uploadImage = async (): Promise<string | null> => {
//     if (!image) return null;

//     const data = new FormData();
//     data.append('file', {
//       uri: image,
//       type: 'image/jpeg',
//       name: 'profile.jpg',
//     } as any);
//     data.append('upload_preset', 'your_upload_preset'); // ← Replace with your Cloudinary preset

//     const res = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
//       method: 'POST',
//       body: data,
//     });

//     const file = await res.json();
//     return file.secure_url;
//   };

//   const handleRegister = async () => {
//     try {
//       const profilePic = await uploadImage();
//       await axiosInstance.post('/auth/register', {
//         name,
//         email,
//         password,
//         profilePic, // Optional field in your backend
//       });
//       alert('Registration successful!');
//       navigation.navigate('Login');
//     } catch (err: any) {
//       console.log('Axios error response:', err.response?.data);
//       alert(err.response?.data?.message || 'Registration failed');
//     }
//   };

//   if (!fontsLoaded) return null;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Register</Text>

//       <TouchableOpacity onPress={pickImage}>
//         <Image
//           source={image ? { uri: image } : require('../assets/placeholder.png')}
//           style={styles.image}
//         />
//         <Text style={styles.uploadText}>Choose Profile Pic (Optional)</Text>
//       </TouchableOpacity>

//       <TextInput
//         placeholder="Name"
//         placeholderTextColor="#aaa"
//         value={name}
//         onChangeText={setName}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Email"
//         placeholderTextColor="#aaa"
//         value={email}
//         onChangeText={setEmail}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Password"
//         placeholderTextColor="#aaa"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleRegister}>
//         <Text style={styles.buttonText}>SIGN UP</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0e0e0e',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   title: {
//     fontFamily: 'PressStart2P',
//     fontSize: 18,
//     color: '#ffffff',
//     marginBottom: 24,
//   },
//   input: {
//     width: '100%',
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#ffffff',
//     borderColor: '#00ffcc',
//     borderWidth: 1,
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 12,
//     backgroundColor: '#1a1a1a',
//   },
//   button: {
//     backgroundColor: '#00ffcc',
//     padding: 14,
//     width: '100%',
//     alignItems: 'center',
//     borderRadius: 6,
//     marginTop: 12,
//   },
//   buttonText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#0e0e0e',
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 10,
//   },
//   uploadText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 8,
//     color: '#aaa',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
// });

// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import axiosInstance from '../api/AxiosInstance';

// export default function RegisterScreen({ navigation }: any) {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission denied', 'Camera roll permissions are required to select a photo.');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
//     }
//   };

//   const uploadImageAsync = async (uri: string) => {
//     // Prepare form data for image upload
//     const formData = new FormData();
//     const filename = uri.split('/').pop() || 'photo.jpg';
//     const match = /\.(\w+)$/.exec(filename);
//     const type = match ? `image/${match[1]}` : 'image/jpeg';

//     formData.append('profilePic', {
//       uri,
//       name: filename,
//       type,
//     } as any);

//     try {
//       const res = await axiosInstance.post('/users/upload-profile-pic', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return res.data.url; // assuming backend returns uploaded URL in { url }
//     } catch (err) {
//       console.error('Image upload failed:', err);
//       Alert.alert('Upload failed', 'Failed to upload profile picture');
//       return null;
//     }
//   };

//   const handleRegister = async () => {
//     try {
//       setUploading(true);
//       let profilePicUrl = null;
//       if (imageUri) {
//         profilePicUrl = await uploadImageAsync(imageUri);
//       }

//       await axiosInstance.post('/auth/register', { name, email, password, profilePicUrl });

//       Alert.alert('Success', 'Registration successful!');
//       navigation.navigate('Login');
//     } catch (err: any) {
//       console.log('Axios error response:', err.response?.data);
//       Alert.alert('Error', err.response?.data?.message || 'Registration failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Register</Text>

//       <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
//         {imageUri ? (
//           <Image source={{ uri: imageUri }} style={styles.image} />
//         ) : (
//           <Text style={styles.imagePickerText}>Pick Profile Picture (optional)</Text>
//         )}
//       </TouchableOpacity>

//       <TextInput
//         placeholder="Name"
//         placeholderTextColor="#aaa"
//         value={name}
//         onChangeText={setName}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Email"
//         placeholderTextColor="#aaa"
//         value={email}
//         onChangeText={setEmail}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Password"
//         placeholderTextColor="#aaa"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />

//       <TouchableOpacity
//         style={[styles.button, uploading ? { backgroundColor: '#555' } : null]}
//         onPress={handleRegister}
//         disabled={uploading}
//       >
//         {uploading ? <ActivityIndicator color="#0e0e0e" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0e0e0e',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   title: {
//     fontFamily: 'PressStart2P',
//     fontSize: 18,
//     color: '#ffffff',
//     marginBottom: 24,
//   },
//   input: {
//     width: '100%',
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#ffffff',
//     borderColor: '#00ffcc',
//     borderWidth: 1,
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 12,
//     backgroundColor: '#1a1a1a',
//   },
//   button: {
//     backgroundColor: '#00ffcc',
//     padding: 14,
//     width: '100%',
//     alignItems: 'center',
//     borderRadius: 6,
//     marginTop: 12,
//   },
//   buttonText: {
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//     color: '#0e0e0e',
//   },
//   imagePicker: {
//     marginBottom: 20,
//     borderColor: '#00ffcc',
//     borderWidth: 1,
//     borderRadius: 6,
//     padding: 10,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#1a1a1a',
//   },
//   imagePickerText: {
//     color: '#00ffcc',
//     fontFamily: 'PressStart2P',
//     fontSize: 10,
//   },
//   image: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//   },
// });

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axiosInstance from '../api/AxiosInstance';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleRegister = async () => {
    try {
      setUploading(true);

      await axiosInstance.post('/auth/register', { name, email, password });

      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (err: any) {
      console.log('Axios error response:', err.response?.data);
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, uploading ? { backgroundColor: '#555' } : null]}
        onPress={handleRegister}
        disabled={uploading}
      >
        {uploading ? <ActivityIndicator color="#0e0e0e" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#ffffff',
    borderColor: '#00ffcc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#1a1a1a',
  },
  button: {
    backgroundColor: '#00ffcc',
    padding: 14,
    width: '100%',
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 12,
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#0e0e0e',
  },
});
