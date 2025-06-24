import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Modal, View, Image, TouchableOpacity, Text, Dimensions, ActivityIndicator  } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PagerView from "react-native-pager-view";

const { width } = Dimensions.get("window");

interface FullScreenViewerProps {
  visible: boolean;
  onClose: () => void;
  originalImage: string | null;
  processedImages: string | null;
  initialPage: number;
  processedLabel?: string;
  onSave?: (imageUrl: string) => void;
  savingImage?: boolean;
}

export default function FullScreenViewer({
  visible,
  onClose,
  originalImage,
  processedImages,
  initialPage,
  processedLabel = "AI Processed",
  onSave,
  savingImage = false
}: FullScreenViewerProps) {

  const fullscreenPagerRef = useRef<PagerView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialPage);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black">
          <StatusBar style="light" />
            <TouchableOpacity
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50"
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

          <PagerView
            style={{ flex: 1 }}
            initialPage={initialPage}
            ref={fullscreenPagerRef}
            onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
          >
            { originalImage && (
              <View key="original" className="flex-1 justify-center">
                <Image
                  source={{ uri: originalImage }}
                  style={{ width: '100%', height: width * 1.2 }}
                  resizeMode="contain"
                />
                <View className="absolute bottom-20 self-center bg-black/50 rounded-full px-3 py-1.5">
                <Text className="text-white">Original</Text>
                </View>
              </View>
            )}
            { processedImages && (
              <View key="processed" className="flex-1 justify-center">
                <Image
                  source={{ uri: processedImages }}
                  style={{ width: '100%', height: width * 1.2 }}
                  resizeMode="contain"
                />
                <View className="absolute bottom-20 self-center bg-black/50 rounded-full px-3 py-1.5">
                  <Text className="text-white">{processedLabel}</Text>
                </View>
              </View>
            )}
          </PagerView>

          <View className="absolute bottom-10 left-0 right-0 flex-row justify-center">
            <View className="flex-row">
              <View className={`w-2 h-2 rounded-full mx-1 ${currentIndex === 0 ? 'bg-white':'bg-gray-500'}`} />
              <View className={`w-2 h-2 rounded-full mx-1 ${currentIndex === 1 ? 'bg-white':'bg-gray-500'}`} />
            </View>
          </View>
          {onSave && processedImages && currentIndex === 1 && (
            <View className="absolute bottom-10 right-4">
              <TouchableOpacity
                className="bg-primary rounded-full p-3 mb-3"
                onPress={() => onSave(processedImages)}
                disabled={savingImage}
              >
                {savingImage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="save-alt" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </GestureHandlerRootView> 
    </Modal>
  );
}
