const fs = require('fs');
const content = `import { useEffect } from \"react\";
import { Stack, useRouter, useSegments } from \"expo-router\";
import { View, ActivityIndicator } from \"react-native\";
import { useAuthStore } from \"../src/stores/authStore\";
import { useOrganizationStore } from \"../src/stores/organizationStore\";
import { QueryProvider } from \"../src/lib/queryProvider\";
import \"../global.css\";

function RootNavigator() {
  const { user, isLoading, init } = useAuthStore();
  const { loadMemberships, clearMemberships } = useOrganizationStore();
  const segments = useSegments();
  const router = useRouter();

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

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === \"(auth)\";

    if (!user && !inAuthGroup) {
      router.replace(\"/(auth)/login\");
    } else if (user && inAuthGroup) {
      router.replace(\"/(tabs)\");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View className=\"flex-1 justify-center items-center bg-background\">
        <ActivityIndicator size=\"large\" color=\"#4f46e5\" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name=\"(tabs)\" />
      <Stack.Screen name=\"(auth)\" />
      <Stack.Screen name=\"index\" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootNavigator />
    </QueryProvider>
  );
}`;
fs.writeFileSync('app/_layout.tsx', content);

