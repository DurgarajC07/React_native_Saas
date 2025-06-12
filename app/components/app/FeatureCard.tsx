import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import GradientCard from "../core/GradientCard";
import { useThemeColors } from "@/hooks/useThemeColor";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  credits?: number;
  onPress?: () => void;
  gradient?: readonly [string, string, ...string[]];
  disabled?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  credits,
  onPress,
  gradient,
  disabled = false,
}) => {
  const colors = useThemeColors();
  return (
    <GradientCard
      onPress={onPress}
      gradientColors={gradient || [colors.card, colors.surface] as readonly [string, string, ...string[]]}
      disabled={disabled}
      style={{ width: '48%', marginBottom: 16 }}
    >
      <View className="items-center mb-4">
        <MaterialIcons name={icon} size={48} color={colors.primary} />
      </View>
      <View className="items-center">
        <Text className="text-lg font-semibold text-center mb-2 text-gray-800 dark:text-white">
          {title}
        </Text>
        <Text className="text-sm text-center text-gray-600 dark:text-gray-300">
          {description}  
        </Text>
        {credits !== undefined && (
          <Text className="text-sm text-center mt-2"
            style={{ color: colors.primary }}>
            {credits} Credits
          </Text>
        )}
      </View>

    </GradientCard>
  );
};

export default FeatureCard;