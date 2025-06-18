import { Alert, TouchableOpacity, StyleSheet, Text } from 'react-native';
import axiosInstance from '../api/AxiosInstance';

const DeleteChallengeButton = ({
  challengeId,
  token,
  onDeleted,
}: {
  challengeId: string;
  token: string;
  onDeleted: () => void;
}) => {
  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this challenge?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/challenges/${challengeId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Success', 'Challenge deleted successfully.');
            onDeleted?.();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.msg || 'Failed to delete challenge');
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity onPress={handleDelete} style={styles.button}>
      <Text style={styles.buttonText}>Delete Challenge</Text>
    </TouchableOpacity>
  );
};

export default DeleteChallengeButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff4d4d',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
