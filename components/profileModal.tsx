import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

type ProfileModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { user, logout } = useAuth();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modal}>
          {user?.profilePicUrl ? (
            <Image source={{ uri: user.profilePicUrl }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, styles.placeholder]}>
              <Text style={styles.placeholderText}>No Pic</Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {user?.nickname || user?.name || 'User'}
          </Text>
          <Text style={styles.email} numberOfLines={2} ellipsizeMode="tail">
            {user?.email}
          </Text>

          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: 280,
    maxWidth: '90%',
    minHeight: 320,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#00ffcc',
    fontFamily: 'PressStart2P',
    fontSize: 10,
  },
  name: {
    color: '#00ffcc',
    fontFamily: 'PressStart2P',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#00ffcc',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginBottom: 16,
  },
  logoutText: {
    color: '#0e0e0e',
    fontFamily: 'PressStart2P',
    fontSize: 12,
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: 6,
  },
  closeText: {
    color: '#ccc',
    fontFamily: 'PressStart2P',
    fontSize: 10,
  },
});
