import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";

interface ImageActionsProps {
  onSave: () => void;
  savingImage: boolean;
}

export default function ImageActions({ onSave, savingImage }: ImageActionsProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row justify-between mb-6">
      <TouchableOpacity
        className="flex-1 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl flex-row justify-center items-center"
        onPress={onSave}
        disabled={savingImage}
      >
        {savingImage ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
          <MaterialIcons name="save-alt" size={20} color={colors.primary} />
          <Text className="ml-2 text-gray-800 dark:text-white ">
            Save</Text>
          </>
        )}
      </TouchableOpacity>
    </View>

  );
}