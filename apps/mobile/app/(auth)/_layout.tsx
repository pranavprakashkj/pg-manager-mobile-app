import { Stack } from "expo-router";
import { fonts, useThemeColors } from "../../src/theme/tokens";

export default function AuthLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surfaceCard },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.extrabold, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.surfacePage },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Forgot Password" }} />
    </Stack>
  );
}
