import React, { useMemo } from "react";
import { View } from "react-native";
import Constants from "expo-constants";
import { AppBar } from "../../src/components/ui/AppBar";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Icon } from "../../src/components/ui/Icon";
import { ListRow } from "../../src/components/ui/ListRow";
import { MetricTile, MetricTiles } from "../../src/components/ui/MetricTile";
import { Screen, ScreenScroll } from "../../src/components/ui/Screen";
import { Text } from "../../src/components/ui/Text";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { showToast } from "../../src/components/ui/Toast";
import { authService } from "../../src/features/auth/authService";
import { useInventory } from "../../src/features/inventory/hooks";
import { occupancyRate, totalCounts } from "../../src/features/inventory/inventory";
import { useOrganization } from "../../src/features/organizations/hooks";
import { useAuthStore } from "../../src/stores/authStore";
import { useOrganizationStore } from "../../src/stores/organizationStore";
import { useThemeColors } from "../../src/theme/tokens";
import { getErrorMessage } from "../../src/utils/errorUtils";

const roleLabel = { owner: "Owner", admin: "Admin" } as const;

export default function Settings() {
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { activeOrganizationId, memberships, setActiveOrganizationId } = useOrganizationStore();
  const { data: organization } = useOrganization(activeOrganizationId);
  const { tree } = useInventory();

  const membership = memberships.find((m) => m.organizationId === activeOrganizationId);
  const totals = useMemo(() => (tree ? totalCounts(tree) : null), [tree]);
  const canSwitch = memberships.length > 1;

  const logout = () =>
    showConfirmDialog({
      title: "Log out?",
      message: "You'll need your email and password to sign back in.",
      confirmLabel: "Log Out",
      destructive: true,
      icon: "log-out",
      onConfirm: () => authService.logout().catch((e) => showToast(getErrorMessage(e), "error")),
    });

  return (
    <Screen>
      <AppBar large title="Settings" subtitle={membership ? `${roleLabel[membership.role]} · ${user?.email ?? ""}` : user?.email ?? undefined} />
      <ScreenScroll gap={20}>
        <Card>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-md bg-primary-soft">
                <Icon name="building" size={22} color={colors.primarySoftInk} />
              </View>
              <View className="min-w-0 flex-1">
                <Text variant="card-title" numberOfLines={1}>
                  {organization?.name ?? "Organization"}
                </Text>
                <Text variant="caption" tone="subtle">
                  {membership ? `You're an ${roleLabel[membership.role].toLowerCase()} here` : "Active organization"}
                </Text>
              </View>
              {canSwitch ? (
                <Button label="Switch" icon="swap" variant="outline" size="sm" onPress={() => setActiveOrganizationId(null)} />
              ) : null}
            </View>
            {tree && totals ? (
              <MetricTiles>
                <MetricTile label="Buildings" value={String(tree.length)} />
                <MetricTile label="Beds" value={String(totals.total)} />
                <MetricTile label="Occupancy" value={`${occupancyRate(totals)}%`} />
              </MetricTiles>
            ) : null}
          </View>
        </Card>

        <View className="gap-2">
          <Text variant="overline" tone="subtle">
            Account
          </Text>
          <Card flush>
            <ListRow icon="users" title={user?.email ?? "Signed in"} subtitle="Signed in with email" trailing={null} />
            <ListRow
              divider
              icon="log-out"
              tone="danger"
              title="Log Out"
              subtitle="You'll need your password to sign back in"
              trailing={null}
              onPress={logout}
            />
          </Card>
        </View>

        <Text variant="caption" tone="subtle" className="text-center">
          PG Manager v{Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </ScreenScroll>
    </Screen>
  );
}
