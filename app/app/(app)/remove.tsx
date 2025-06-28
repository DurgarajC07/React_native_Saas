import Button from "@/components/core/Button";
import React, { useState } from "react";
import { View, Text, Alert, ScrollView, TextInput } from "react-native";
import { useSession } from "@/context/AuthContext";
import axios from "axios";
import axiosInstance from "@/config/axiosConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColor";
import { 
  ImageSelector, 
  ImageComparison, 
  ImageActions, 
  FullScreenViewer, 
  ProcessingOverlay,
  saveImageToGallery,
  requestMediaPermission
} from "@/components/images";

export default function Remove() {
  const session = useSession();
  const user = session?.user;
  const updateUser = session?.updateUser;
  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [savingImage, setSavingImage] = useState(false);
  const [prompt, setPrompt] = useState<string>("");

  const handleImageSelected = () => {
    setGeneratedImage(null);
  };

  const handleUpload = async () => {
    if(!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;    
    }
    
    if(!prompt.trim()) {
      Alert.alert("Prompt Required", "Please describe what you want to remove from the image.");
      return;
    }
    
    setIsLoading(true);

    const formData = new FormData();
    
    formData.append("image", {
      uri: selectedImage,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    formData.append("prompt", prompt.trim());
    
    try {
      const response = await axiosInstance.post('/api/image/remove', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Authorization: `Bearer ${user?.token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert("Success", "Object removed successfully!");
        setGeneratedImage(response.data.transformed_url);       
        if (user && response.data.credits){
          const updatedUser = { ...user, credits: response.data.credits };
          if (updateUser) {
            await updateUser(updatedUser);
          }
        }
      } 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Error", error.response?.data?.message || "Failed to remove object.");
      } else {
         console.error("Error:", error);
         Alert.alert("Error", "Failed to remove object.");
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
      'removed-object-image.jpg', 
      'AI Generated Images'
    );
    setSavingImage(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Remove Object",
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
            placeholder="Select an Image to remove objects with AI"
          />

          {selectedImage && (
            <>
              <View className="w-full">
                <View className="flex-row items-center mb-3 mt-2">
                  <MaterialIcons name="auto-fix-high" size={24} color={colors.primary} />
                  <Text className="text-lg font-bold ml-2 text-gray-800 dark:text-white">
                    Describe What to Remove
                  </Text>
                </View>
                
                <View className="w-full mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <Text className="text-gray-700 dark:text-gray-300 mb-2">
                    What object or element do you want to remove from the image?
                  </Text>
                  <View className={`bg-white dark:bg-gray-700 rounded-lg border p-3 ${
                    prompt.trim() ? 
                    'border-gray-300 dark:border-gray-600' : 
                    'border-red-300 dark:border-red-600'
                  }`}>
                    <TextInput
                      value={prompt}
                      onChangeText={setPrompt}
                      placeholder="e.g. person in the background, watermark, unwanted object..."
                      placeholderTextColor={colors.secondaryText}
                      className="text-gray-800 dark:text-white"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                  <Text className={`text-xs mt-2 ${
                    prompt.trim() ? 
                    'text-gray-500 dark:text-gray-400' : 
                    'text-red-500 dark:text-red-400'
                  }`}>
                    {prompt.trim() ? 
                      'Be specific about what you want to remove for best results.' :
                      'This field is required - describe what to remove.'
                    }
                  </Text>
                </View>

                {generatedImage && (
                  <>
                    <ImageComparison
                      originalImage={selectedImage}
                      processedImage={generatedImage}
                      processedLabel="Object Removed"
                      onFullscreenRequest={(index: number) => {
                        setCurrentFullscreenIndex(index);
                        setFullscreenVisible(true);
                      }}
                    />
                    <ImageActions
                      onSave={() => handleSaveImage(generatedImage!)}
                      savingImage={savingImage}
                    />
                  </>
                )}

                <Button
                  onPress={handleUpload}
                  className="w-full mt-2"
                  disabled={isLoading || !prompt.trim()}
                  loading={isLoading}
                >
                  <View className="flex-row items-center justify-center">
                    <MaterialIcons name="auto-fix-high" size={20} color="white" />
                    <Text className="text-white text-center font-medium ml-2">
                      {isLoading ? "Removing Object..." : "Remove Object"}
                    </Text>
                  </View>
                </Button>
              </View>
            </>
          )}

          <ProcessingOverlay 
            visible={isLoading} 
            message="Removing object with AI magic..." 
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
