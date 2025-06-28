import Button from "@/components/core/Button";
import React, { useState } from "react";
import { View, Text, Alert, ScrollView, TouchableOpacity, Modal, Dimensions, TextInput } from "react-native";
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
import ColorPicker from "react-native-wheel-color-picker";

// Add this for the width calculation
const { width } = Dimensions.get('window');

export default function Recolor() {
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
  const [targetPart, setTargetPart] = useState<string>("");
  
  // Add missing state variables for color picker
  const [selectedColor, setSelectedColor] = useState<string>("#FF0000");
  const [currentColor, setCurrentColor] = useState<string>("#FF0000");
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  
  // Add predefined colors array
  const predefinedColors = [
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", 
    "#00FFFF", "#000000", "#FFFFFF", "#FF8000", "#8000FF"
  ];

  const handleImageSelected = () => {
    setGeneratedImage(null);
  };

  // Add missing functions for color picker
  const onColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const selectPredefinedColor = (color: string) => {
    setSelectedColor(color);
  };
  const handleUpload = async () => {
    if(!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;    
    }
    
    if(!targetPart.trim()) {
      Alert.alert("Target Part Required", "Please specify which part of the image you want to recolor.");
      return;
    }
    
    setIsLoading(true);

    const formData = new FormData();
    
    formData.append("image", {
      uri: selectedImage,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    formData.append("target_part", targetPart.trim());
    formData.append("color", selectedColor.replace("#", ""));
    try {
      const response = await axiosInstance.post('/api/image/recolor', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Authorization: `Bearer ${user?.token}`,
        },
      });      if (response.status === 200) {
        Alert.alert("Success", "Image recolored successfully!");
        setGeneratedImage(response.data.transformed_url);       
        if (user && response.data.credits){
          const updatedUser = { ...user, credits: response.data.credits };
          if (updateUser) {
            await updateUser(updatedUser);
          }
        }
      }} catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Error", error.response?.data?.message || "Failed to recolor image.");
      } else {
         console.error("Error:", error);
         Alert.alert("Error", "Failed to recolor image.");
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
      'recolored-image.jpg', 
      'AI Generated Images'
    );
    setSavingImage(false);
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: "Recolor Object",
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
          placeholder="Select an Image to recolor with AI"
        />        {selectedImage && (
          <>
            <View className="w-full">
              <View className="flex-row items-center mb-3 mt-2">
                <MaterialIcons name="edit" size={24} color={colors.primary} />
                <Text className="text-lg font-bold ml-2 text-gray-800 dark:text-white">
                  Specify Target Part
                </Text>
              </View>
              
              <View className="w-full mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <Text className="text-gray-700 dark:text-gray-300 mb-2">
                 What part of the image do you want to recolor?</Text>                <View className={`bg-white dark:bg-gray-700 rounded-lg border p-3 ${
                  targetPart.trim() ? 
                  'border-gray-300 dark:border-gray-600' : 
                  'border-red-300 dark:border-red-600'
                }`}>
                  <TextInput
                    value={targetPart}
                    onChangeText={setTargetPart}
                    placeholder="e.g. car, sky, grass, etc."
                    placeholderTextColor={colors.secondaryText}
                    className="text-gray-800 dark:text-white"
                  />
                </View>
                <Text className={`text-xs mt-2 ${
                  targetPart.trim() ? 
                  'text-gray-500 dark:text-gray-400' : 
                  'text-red-500 dark:text-red-400'
                }`}>
                  {targetPart.trim() ? 
                    'Be specific about which part of the image you want to recolor.' :
                    'This field is required - specify the part to recolor.'
                  }
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <MaterialIcons name="palette" size={24} color={colors.primary} />
                <Text className="text-lg font-bold ml-2 text-gray-800 dark:text-white">
                  Select Color
                </Text>
              </View>              <TouchableOpacity
                onPress={() => {
                  setCurrentColor(selectedColor);
                  setColorPickerVisible(true);
                }}
                className="flex-row items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 border border-gray-200 dark:border-gray-700"
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: selectedColor, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' }} />
                <View className="ml-4 flex-1">
                  <Text className="text-gray-800 dark:text-white font-medium">Selected Color</Text>
                  <Text className="text-gray-500 dark:text-gray-400">
                    {selectedColor}
                  </Text>
                </View>
                <MaterialIcons name="edit" size={24} color={colors.primary} />
              </TouchableOpacity>
              
              <Text className="text-gray-700 dark:text-gray-300 mb-2">
                Quick Select Colors:
              </Text>
              <View className="flex-row flex-wrap mb-6">
                {predefinedColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => selectPredefinedColor(color)}
                    style={{ 
                      backgroundColor: color,
                      width: width / 6 - 10,
                      height: width / 6 - 10,
                      margin: 5,
                      borderRadius: 8,
                      borderWidth:  selectedColor === color ? 3 : 1,
                      borderColor: selectedColor === color ? colors.primary : '#ccc',
                    }} 
                    activeOpacity={0.7}
                  />
                ))}
              </View>              <Modal
                visible={colorPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setColorPickerVisible(false)}
              >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                  <View className="bg-white dark:bg-gray-900 p-6 rounded-3xl mx-4 w-full max-w-sm shadow-lg">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-xl font-bold text-gray-800 dark:text-white">
                        Pick a Color
                      </Text>
                      <TouchableOpacity
                        onPress={() => setColorPickerVisible(false)}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
                      >
                        <MaterialIcons name="close" size={20} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                    
                    <View className="h-64 mb-4">
                      <ColorPicker
                        color={currentColor}
                        onColorChange={onColorChange}
                        thumbSize={30}
                        sliderSize={30}
                        noSnap={true}
                        row={false}
                        swatches={false}
                      />
                    </View>
                    
                    <View className="flex-row items-center mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <View style={{ 
                        backgroundColor: currentColor, 
                        width: 30, 
                        height: 30, 
                        borderRadius: 15, 
                        borderWidth: 1, 
                        borderColor: '#ccc',
                        marginRight: 12
                      }} />
                      <Text className="text-gray-800 dark:text-white font-medium">
                        {currentColor}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <TouchableOpacity
                        onPress={() => setColorPickerVisible(false)}
                        className="flex-1 mr-2 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
                      >
                        <Text className="text-center text-gray-800 dark:text-white font-medium">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedColor(currentColor);
                          setColorPickerVisible(false);
                        }}
                        className="flex-1 ml-2 p-3 rounded-lg"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-center text-white font-medium">
                          Select Color
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
              {generatedImage && (
                <>
                  <ImageComparison
                    originalImage={selectedImage}
                    processedImage={generatedImage}
                    processedLabel="Recolored"
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
              )}              <Button
                onPress={handleUpload}
                className="w-full mt-2"
                disabled={isLoading || !targetPart.trim()}
                loading={isLoading}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name="auto-fix-high" size={20} color="white" />
                  <Text className="text-white text-center font-medium ml-2">
                    {isLoading ? "Recoloring..." : "Recolor Image"}
                  </Text>
                </View>
              </Button>
            </View>
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