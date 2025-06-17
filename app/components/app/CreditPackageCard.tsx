import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColor"; 
import GradientCard from "../core/GradientCard";

export interface CreditPackage {
  credits: number;
  price: number;  
  gradient?: readonly [string, string, ...string[]];
  popular?: boolean;
}

interface CreditPackageCardProps {
  package: CreditPackage;
  onPress: (credits: number, price: number) => void;
  disabled?: boolean;
}

const CreditPackageCard: React.FC<CreditPackageCardProps> = 
({
  package: pkg,
  onPress,
  disabled = false,   
}) => {
  const colors = useThemeColors();

  return (
    <GradientCard
      onPress={() => onPress(pkg.credits, pkg.price)}
      gradientColors={pkg.gradient}
      badgeVisible={pkg.popular}
      badgeText="Popular"
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold dark:text-white text-gray-800 mb-1">
            {pkg.credits} Credits
          </Text>
        </View>
       <MaterialIcons name="arrow-forward" size={24} color={colors.primary} />
       
      </View>
    </GradientCard>
  );
};

export default CreditPackageCard;