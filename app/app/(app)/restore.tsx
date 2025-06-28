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

export default function Restore() {
  const { user, updateUser } = useSession();
  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [savingImage, setSavingImage] = useState(false);

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

    try {
      const response = await axiosInstance.post('/api/image/restore', formData, {
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
      'restored-image.jpg', 
      'AI Generated Images'
    );
    setSavingImage(false);
  };

  return (
    <>    <Stack.Screen
      options={{
        title: "Restore Image",
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
          placeholder="Select old Image for restore"
        />

        {selectedImage && (
          <>
            
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
                  {isLoading ? "Restoring..." : "Restore"}
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