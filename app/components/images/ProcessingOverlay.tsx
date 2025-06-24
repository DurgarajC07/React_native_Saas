import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColor";

interface ProcessingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function ProcessingOverlay({ visible, message = "Processing your image..." }: ProcessingOverlayProps) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <View className="absolute inset-0 flex items-center justify-center bg-black/30">
      <View className="bg-white dark:bg-gray-800 p-4 rounded-xl flex-row items-center">
        <ActivityIndicator size={"small"} color={colors.primary} />
        <Text className="ml-3 text-gray-700 dark:text-gray-300">{message}</Text>
      </View>
    </View>


  );
}