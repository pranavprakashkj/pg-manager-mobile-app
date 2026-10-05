import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Login() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-primary mb-4">Login</Text>
      <TouchableOpacity 
        className="bg-primary px-6 py-3 rounded-lg"
        onPress={() => router.replace("/(tabs)")}
      >
        <Text className="text-white font-semibold">Bypass to Dashboard (Dev)</Text>
      </TouchableOpacity>
    </View>
  );
}
