import React, { useState } from "react";
import { View, Text, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import Button from "@/components/core/Button";
import Input from "@/components/core/Input";
import axiosInstance from "@/config/axiosConfig";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";

const Signup = () => {
  const { currentTheme } = useTheme();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (key: string, value: string) => {
    setData({ ...data, [key]: value });
  };

  const resetForm = () => {
    setData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    });
  };

  const handleSignup = async () => {
    setLoading(true);
    setErrors({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    });

    try {
      await axiosInstance.post('/api/register', data);
      resetForm();
      setSuccessMessage("Account created successfully! Please check your email to verify your account.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData?.errors) {
          setErrors(responseData.errors);
        } else if (responseData?.message) {
          Alert.alert("Error", responseData.message);
        }
      } else {
        console.error("Error: ", error);
        Alert.alert("Error", "Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className={`flex-1 px-6 py-10 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          <View className="items-center mb-6">
            <Image
              source={require('../assets/images/landing.png')}
              className="w-32 h-32"
              resizeMode="contain"
            />
            <Text className={`text-2xl font-bold mt-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Imaginary
            </Text>
          </View>

          <Text className={`text-3xl font-bold mb-6 text-center ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Signup
          </Text>

          {!!successMessage && (
            <Text className="bg-emerald-600 text-white rounded-lg py-3 px-4 mb-4 text-center">
              {successMessage}
            </Text>
          )}

          <View className="space-y-4">
            <Input
              placeholder="Name"
              value={data.name}
              onChangeText={(value) => handleChange("name", value)}
              error={errors.name}
            />
            <Input
              placeholder="Email"
              value={data.email}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              placeholder="Password"
              value={data.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry
              error={errors.password}
            />
            <Input
              placeholder="Confirm Password"
              value={data.password_confirmation}
              onChangeText={(value) => handleChange("password_confirmation", value)}
              secureTextEntry
              error={errors.password_confirmation}
            />
          </View>

          <View className="mt-6">
            <Button onPress={handleSignup} disabled={loading}>
              <View className="flex-row items-center justify-center">
                {loading && (
                  <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                )}
                <Text className="text-white font-semibold">Signup</Text>
              </View>
            </Button>
          </View>

          <Text className={`text-base text-center mt-6 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link href="/sign-in">
              <Text className="text-primary underline">Sign in</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
