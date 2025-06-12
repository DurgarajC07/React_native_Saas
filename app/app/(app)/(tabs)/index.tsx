import axiosInstance from "@/config/axiosConfig";
import { useSession } from "@/context/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { use, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeatureCard from "@/components/app/FeatureCard";

export default function index() {
  const colors = useThemeColors();
  const { user } = useSession();
  const [ operationCredits, setOperationCredits ] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchOperationCredits = async () => {
      try {
        const response = await axiosInstance.get('/api/operations/credits');
        setOperationCredits(response.data.operations);
      } catch (error) {
        console.error("Failed to fetch operation credits:", error);
      }
    };

    fetchOperationCredits();
  },[]);

  const cards = [
    {
      title: "Generative Fill",
      description: "Expand your images with AI-generated content.",
      icon: "auto-fix-high",
      route: "/generative-fill",
      operationType: "generative_fill"
    },
    {
      title: "Restore Images",
      description: "Enhance and restore old or damaged images.",
      icon: "restore",
      route: "/restore",
      operationType: "restore"
    },
    {
      title: "Recolor Images",
      description: "Change the color scheme of your images effortlessly.",
      icon: "palette",
      route: "/recolor",    
      operationType: "recolor"
    },
    {
      title: "Remove Objects",
      description: "Easily remove unwanted objects from your images.",
      icon: "remove-circle-outline",
      route: "/remove",
      operationType: "remove_object"
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900"> 
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="flex flex-row flex-wrap justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">
              Welcome, {user?.name}!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/credits')}
              className="flex-row items-center"
            >
              <MaterialIcons 
                name="stars" 
                size={24}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text className="text-2xl font-bold text-gray-800 dark:text-white">
                {user?.credits || 0} Credits
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between mb-6">
            {cards.map((card) =>(
              <FeatureCard 
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon as keyof typeof MaterialIcons.glyphMap}
                gradient={[colors.card, colors.surface] as readonly [string, string, ...string[]]}
                credits={operationCredits[card.operationType] || 0}
                onPress={() => router.push(card.route as any)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}