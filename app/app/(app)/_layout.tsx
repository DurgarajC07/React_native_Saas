import { useSession } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColor';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

const AppLayout = () => {
  const { session, isLoading } = useSession();
  const colors = useThemeColors();

  if(isLoading){
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-2 text-gray-800 dark:text-white">
        Loading...
      </Text>

    </View>
    );
  }

  if(!session){
    return <Redirect href="/sign-in" />
  }

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.primary,
      headerTitleStyle: {
        color: colors.text,
      },
      contentStyle: {
        backgroundColor: colors.background,
      }
    }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} />
      <Stack.Screen 
        name="restore" 
        options={{ headerTitle: "Restore Images" }} />
        <Stack.Screen 
          name="generative-fill" 
          options={{ headerTitle: "Generative Fill" }} />
          <Stack.Screen 
            name="recolor" 
            options={{ headerTitle: "Recolor Images" }} />
             <Stack.Screen 
                name="remove" 
                options={{ headerTitle: "Remove Objects" }} />
    </Stack>
  )
}