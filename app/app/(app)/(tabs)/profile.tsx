import Button from '@/components/core/Button';
import { useSession } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColor';
import { View, Text, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const session = useSession();
  const user = session?.user;
  const signOut = session?.signOut;
  const colors = useThemeColors();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to log out?")) {
        signOut?.();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => signOut?.()
          }
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 p-4">
        <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl border-gray-200 dark:border-gray-700 shadow-lg mb-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Profile
          </Text>
          <View className="space-y-2">
            <View className="p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-sm mb-1" style={{ color: colors.secondaryText }}>
                Name
              </Text>
              <Text className="text-lg" style={{ color: colors.text }}>
                {user?.name || 'Guest User'}
              </Text>
            </View>
            <View className="p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-sm mb-1" style={{ color: colors.secondaryText }}>
                Email
              </Text>
              <Text className="text-lg" style={{ color: colors.text }}>
                {user?.email || 'Not logged in'}
              </Text>
            </View>
          </View>
        </View>
        <Button
          onPress={handleLogout}
          className="rounded-2xl shadow-lg"
          variant="danger"
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
