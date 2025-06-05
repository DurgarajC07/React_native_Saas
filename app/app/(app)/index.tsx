import { useSession } from '@/context/AuthContext';
import Button from "@/components/core/Button";
import React from 'react';
import { Alert, Platform, Text, View } from 'react-native';

const Main = () => {
  const { user, signOut } = useSession();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        signOut();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => signOut(),
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-white dark:bg-gray-900">
      <Text className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
        Welcome, {user?.name}
      </Text>
      
      <Button
        onPress={handleLogout}
        variant="danger"
        className="rounded-2xl shadow-lg"
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </Button>
    </View>
  );
};

export default Main;
