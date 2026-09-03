import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Add your authentication logic here
    console.log("Login pressed");
    // router.replace("/(auth)"); // Navigate to main app after login
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        {/* App Logo/Title */}
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-blue-600">LockedIn</Text>
          <Text className="text-gray-500 text-lg mt-2">Welcome Back!</Text>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-1 font-medium">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-4 items-center"
          onPress={handleLogin}
        >
          <Text className="text-white font-semibold text-lg">Login</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          className="mt-4 items-center"
          onPress={() => router.push("/register")}
        >
          <Text className="text-blue-600">
            Don't have an account? <Text className="font-bold">Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}