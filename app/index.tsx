import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately
    router.replace("/login");
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-green-500">
      <Text className="text-white text-4xl">Loading...</Text>
    </View>
  );
}