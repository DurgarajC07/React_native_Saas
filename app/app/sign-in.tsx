import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import Button from "@/components/core/Button";
import Input from "@/components/core/Input";
import { useSession } from "@/context/AuthContext";
import axios from "axios";
import axiosInstance from "@/config/axiosConfig";
import { useTheme } from "@/context/ThemeContext";

const Login = () => {
  const { signIn } = useSession();
  const { currentTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (key: string, value: string) => {
    setData({ ...data, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrors({ email: "", password: "" });

    try {
      const response = await axiosInstance.post("/api/login", data);
      await signIn(response.data.token, response.data.user);
      router.replace("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData?.errors) {
          setErrors(responseData.errors);
        } else if (responseData?.message) {
          Alert.alert("Error", responseData.message);
        } else {
          Alert.alert("Error", "An unexpected error occurred");
        }
      } else {
        console.error("Error:", error);
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
        <View
          className={`flex-1 px-6 py-10 ${
            currentTheme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          <View className="items-center mb-6">
            <Image
              source={require("../assets/images/landing.png")}
              className="w-32 h-32"
              resizeMode="contain"
            />
            <Text
              className={`text-2xl font-bold mt-3 ${
                currentTheme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Imaginary
            </Text>
          </View>

          <Text
            className={`text-3xl font-bold mb-6 text-center ${
              currentTheme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Sign In
          </Text>

          <View className="space-y-4">
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
          </View>

          <View className="mt-6">
            <Button onPress={handleLogin} disabled={loading}>
              <View className="flex-row items-center justify-center">
                {loading && (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                    className="mr-2"
                  />
                )}
                <Text className="text-white font-semibold">Sign In</Text>
              </View>
            </Button>
          </View>

          <Text
            className={`text-base text-center mt-6 ${
              currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Don’t have an account?{" "}
            <Link href="/signup">
              <Text className="text-primary underline">Sign up</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
