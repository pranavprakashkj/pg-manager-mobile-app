import { View, Text } from "react-native";

export default function Dashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-primary">Dashboard</Text>
      <Text className="text-inactive mt-2">Occupancy, Payments summary goes here</Text>
    </View>
  );
}
