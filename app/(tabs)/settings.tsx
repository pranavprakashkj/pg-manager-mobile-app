import React from "react";
import { View, Text, Alert } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { authService } from "../../src/features/auth/authService";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function Settings() {
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error: unknown) {
      Alert.alert("Error", getErrorMessage(error) || "Failed to logout");
    }
  };

  return (
    <View className="flex-1 p-6 bg-background">
      <Text className="text-xl font-bold text-primary mb-6">Settings</Text>
      <Button label="Logout" variant="danger" onPress={handleLogout} />
    </View>
  );
}
