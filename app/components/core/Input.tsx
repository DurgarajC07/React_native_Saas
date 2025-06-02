import { useTheme } from "@/context/ThemeContext";
import React, {useState} from "react";
import { TextInputProps, StyleSheet, View, Text, TextInput } from "react-native";

interface InputProps extends TextInputProps{
  error?: string;
}

const Input = ({
  value,
  placeholder,
  keyboardType,
  secureTextEntry,
  onChangeText,
  error= "",
} : InputProps) => {
  const [isFocused, setIsfocused] = useState(false);
  const {currentTheme} = useTheme();

  return (
    <View className="w-full mb-4">
      <TextInput
        className={`w-full h-12 border rounded-lg px-3 mb-1 ${currentTheme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} ${
          isFocused ? "border-primary": currentTheme === 'dark' ? 
          "border-gray-600" : "border-gray-300"
        }${error ? "border-red-500": ""}`}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={currentTheme === 'dark' ? "gray" : "#9CA3AF"}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        onFocus={() => setIsfocused(true)}
        onBlur={() => setIsfocused(false)}
      />
      {!!error && (
        <Text className="text-left justify-start text-red-500">{error}</Text>
      )}
    </View>
  );
};

export default Input;