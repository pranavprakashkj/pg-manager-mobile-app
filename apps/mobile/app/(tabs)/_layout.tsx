import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconName } from "../../src/components/ui/Icon";
import { fonts, useThemeColors } from "../../src/theme/tokens";

function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const colors = useThemeColors();
  return (
    <View
      className="h-7 w-12 items-center justify-center rounded-full"
      style={focused ? { backgroundColor: colors.primarySoft } : undefined}
    >
      <Icon name={name} size={20} color={focused ? colors.primarySoftInk : color} />
    </View>
  );
}

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Home", icon: "home" },
  { name: "rooms", title: "Rooms", icon: "bed" },
  { name: "guests", title: "Guests", icon: "users" },
  { name: "payments", title: "Payments", icon: "wallet" },
  { name: "settings", title: "Settings", icon: "settings" },
];

export default function TabLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.inkSubtle,
        tabBarStyle: {
          backgroundColor: colors.surfaceCard,
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, marginTop: 2 },
        sceneStyle: { backgroundColor: colors.surfacePage },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon name={t.icon} focused={focused} color={focused ? colors.primaryText : colors.inkSubtle} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
