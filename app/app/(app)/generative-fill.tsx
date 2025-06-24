import Button from "@/components/core/Button";
import React, { useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { useSession } from "@/context/AuthContext";
import axios from "axios";
import axiosInstance from "@/config/axiosConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColor";
import AspectRatioSelector, { AspectRatio } from "@/components/app/AspectRatioSelector";
import { 
  ImageSelector, 
  ImageComparison, 
  ImageActions, 
  FullScreenViewer, 
  ProcessingOverlay,
  saveImageToGallery,
  requestMediaPermission
} from "@/components/images";

export default function GenerativeFill() {
  const { user, updateUser } = useSession();
  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [savingImage, setSavingImage] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const ASPECT_RATIOS: AspectRatio[] = [
    { value: '1:1', width: 40, height: 40},
    { value: '4:3', width: 40, height: 30 },
    { value: '16:9', width: 48, height: 27 },
  ];

  const handleImageSelected = () => {
    setGeneratedImage(null);
  };

  const handleUpload = async () => {
    if(!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;    }
    setIsLoading(true);

    const formData = new FormData();
    
    formData.append("image", {
      uri: selectedImage,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    formData.append("aspectRatio", selectedRatio);

    try {
      const response = await axiosInstance.post('/api/image/fill', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Authorization: `Bearer ${user?.token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert("Success", "Image Transformed successfully!");
        setGeneratedImage(response.data.transformed_url);

        if (user && response.data.credits){
          const updatedUser = { ...user, credits: response.data.credits };
          // Alert.alert(JSON.stringify(updatedUser));
          await updateUser(updatedUser);
        }
      } 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Error", error.response?.data?.message || "Failed to generate fill.");
      } else {
         console.error("Error:", error);
         Alert.alert("Error", "Failed to generate fill.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveImage = async (imageUri: string) => {
    setSavingImage(true);
    const hasPermission = await requestMediaPermission();
    
    if (!hasPermission) {
      Alert.alert("Permission Required", "Please grant media library permission to save images.");
      setSavingImage(false);
      return;
    }

    const success = await saveImageToGallery(
      imageUri, 
      'generative-fill-image.jpg', 
      'AI Generated Images'
    );
    setSavingImage(false);
  };

  return (
    <>    <Stack.Screen
      options={{
        title: "Generative Fill",
        headerTintColor: colors.text,
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center p-4">
        <ImageSelector
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onImageSelected={handleImageSelected}
          placeholder="Select an Image for generative fill"
        />

        {selectedImage && (
          <>
            <View className="flex-row items-center mb-3 mt-2">
              <MaterialIcons name="aspect-ratio" size={24} color={colors.primary} />
              <Text className="text-lg font-bold ml-2 text-gray-800 dark:text-white">Select Aspect Ratio</Text>
            </View>
            <View className="w-full mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <AspectRatioSelector
                ratios={ASPECT_RATIOS}
                selectedRatio={selectedRatio}
                onSelectRatio={setSelectedRatio}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Select the aspect ratio for your generated image.
              </Text>
            </View>

            {generatedImage && (
              <>
                <ImageComparison
                  originalImage={selectedImage}
                  processedImage={generatedImage}
                  processedLabel="AI Generated"
                  onFullscreenRequest={(index) => {
                    setCurrentFullscreenIndex(index);
                    setFullscreenVisible(true);
                  }}
                />
                <ImageActions
                  onSave={() => handleSaveImage(generatedImage)}
                  savingImage={savingImage}
                />
              </>
            )}

            <Button
              onPress={handleUpload}
              className="w-full mt-2"
              disabled={isLoading}
              loading={isLoading}
            >
              <View className="flex-row items-center justify-center">
                <MaterialIcons name="auto-fix-high" size={20} color="white" />
                <Text className="text-white text-center font-medium">
                  {isLoading ? "Generating Fill..." : "Generate Fill"}
                </Text>
              </View>
            </Button>
          </>
        )}

        <ProcessingOverlay 
          visible={isLoading} 
          message="Applying AI magic..." 
        />
      </View>
    </ScrollView>

    <FullScreenViewer
      visible={fullscreenVisible}
      onClose={() => setFullscreenVisible(false)}
      originalImage={selectedImage}
      processedImages={generatedImage}
      initialPage={currentFullscreenIndex}
      processedLabel="AI Generated"
      onSave={handleSaveImage}
      savingImage={savingImage}
    />
    </>
  );
}