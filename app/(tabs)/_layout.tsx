import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#4f46e5" }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="rooms" options={{ title: "Rooms" }} />
      <Tabs.Screen name="guests" options={{ title: "Guests" }} />
      <Tabs.Screen name="payments" options={{ title: "Payments" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
