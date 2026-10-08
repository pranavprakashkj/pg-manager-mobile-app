import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useAuthStore } from "../src/stores/authStore";
import { useOrganizationStore } from "../src/stores/organizationStore";
import { QueryProvider } from "../src/lib/queryProvider";
import { resolveRedirect } from "../src/navigation/resolveRedirect";
import { ConfirmDialogHost } from "../src/components/ui/ConfirmDialog";
import { ToastHost } from "../src/components/ui/Toast";
import { Card } from "../src/components/ui/Card";
import { EmptyState } from "../src/components/ui/EmptyState";
import { authService } from "../src/features/auth/authService";
import { getErrorMessage } from "../src/utils/errorUtils";
import { useThemeColors } from "../src/theme/tokens";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, isLoading, init } = useAuthStore();
  const { loadMemberships, clearMemberships, selectionState, isLoadingMemberships, membershipsError } =
    useOrganizationStore();
  const segments = useSegments();
  const router = useRouter();
  const colors = useThemeColors();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user) {
      loadMemberships(user.uid);
    } else if (!isLoading) {
      clearMemberships();
    }
  }, [user, isLoading, loadMemberships, clearMemberships]);

  const isAppLoading = isLoading || (!!user && (isLoadingMemberships || selectionState === "loading"));

  useEffect(() => {
    if (isAppLoading) return;
    const target = resolveRedirect({ isAuthenticated: !!user, selectionState, segments });
    if (target) router.replace(target);
  }, [isAppLoading, user, selectionState, segments, router]);

  if (user && membershipsError) {
    return (
      <View className="flex-1 justify-center bg-surface-page p-4">
        <Card>
          <EmptyState
            tone="danger"
            icon="alert"
            title="Couldn't load your organizations"
            message={`${getErrorMessage(membershipsError)} Your data is safe.`}
            action="Try Again"
            actionIcon="refresh"
            onAction={() => loadMemberships(user.uid)}
            secondaryAction="Log Out"
            secondaryIcon="log-out"
            onSecondary={() => authService.logout()}
          />
        </Card>
      </View>
    );
  }

  if (isAppLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-page">
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surfacePage } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="organization/create" />
      <Stack.Screen name="organization/select" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryProvider>
      <StatusBar style="auto" />
      <RootNavigator />
      <ConfirmDialogHost />
      <ToastHost />
    </QueryProvider>
  );
}
