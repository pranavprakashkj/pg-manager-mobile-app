import React, { useMemo } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { AppBar } from "../../src/components/ui/AppBar";
import { Badge } from "../../src/components/ui/Badge";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { Icon, IconName } from "../../src/components/ui/Icon";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { MetricTile, MetricTiles } from "../../src/components/ui/MetricTile";
import { Screen, ScreenScroll } from "../../src/components/ui/Screen";
import { StatCard } from "../../src/components/ui/StatCard";
import { Text } from "../../src/components/ui/Text";
import { useInventory } from "../../src/features/inventory/hooks";
import { occupancyRate, totalCounts } from "../../src/features/inventory/inventory";
import { useOrganization } from "../../src/features/organizations/hooks";
import { useOrganizationStore } from "../../src/stores/organizationStore";
import { useThemeColors } from "../../src/theme/tokens";
import { getErrorMessage } from "../../src/utils/errorUtils";
import { pluralize } from "../../src/utils/format";

function greeting(date: Date) {
  const h = date.getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-w-[64px] flex-1 items-center gap-2 rounded-md p-1 active:bg-surface-sunken"
    >
      <View className="h-12 w-12 items-center justify-center rounded-md bg-primary-soft">
        <Icon name={icon} size={22} color={colors.primarySoftInk} />
      </View>
      <Text variant="label" className="text-center">
        {label}
      </Text>
    </Pressable>
  );
}

export default function Home() {
  const colors = useThemeColors();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  const { data: organization } = useOrganization(activeOrganizationId);
  const { tree, isLoading, isError, error, isRefetching, refetch } = useInventory();

  const now = new Date();
  const eyebrow = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  const totals = useMemo(() => (tree ? totalCounts(tree) : null), [tree]);
  const header = <AppBar large eyebrow={eyebrow} title={greeting(now)} subtitle={organization?.name} />;

  if (isLoading) {
    return (
      <Screen>
        {header}
        <LoadingState message="Loading occupancy" rows={2} withSummary />
      </Screen>
    );
  }

  if (isError || !tree || !totals) {
    return (
      <Screen>
        {header}
        <ErrorState title="Couldn't load occupancy" message={getErrorMessage(error)} onRetry={refetch} />
      </Screen>
    );
  }

  const rate = occupancyRate(totals);

  return (
    <Screen>
      {header}
      <ScreenScroll
        gap={20}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <View className="flex-row items-center justify-between">
          <Badge label="Live occupancy" tone="info" dot />
          <Text variant="caption" tone="subtle">
            {pluralize(tree.length, "building")} · {pluralize(totals.total, "bed")}
          </Text>
        </View>

        <Card>
          <View className="flex-row">
            <QuickAction icon="door" label="Add Room" onPress={() => router.push("/floor/add-room")} />
            <QuickAction icon="building" label="Add Building" onPress={() => router.push("/building/add")} />
          </View>
        </Card>

        {tree.length === 0 ? (
          <Card>
            <EmptyState
              icon="building"
              title="Add your first property"
              message="Set up buildings, floors, rooms and beds once. Occupancy builds on it."
              action="Add Building"
              actionIcon="plus"
              onAction={() => router.push("/building/add")}
            />
          </Card>
        ) : (
          <StatCard
            label={`Occupancy · ${pluralize(totals.total, "bed")}`}
            value={`${rate}%`}
            suffix="filled"
            icon="bed"
            progress={rate}
            progressStart={`${totals.occupied} of ${pluralize(totals.total, "bed")} occupied`}
            progressEnd={`${totals.vacant} free`}
          >
            <MetricTiles>
              <MetricTile label="Occupied" dot="info" value={String(totals.occupied)} sub={`${rate}% rate`} />
              <MetricTile label="Vacant" dot="success" value={String(totals.vacant)} sub="Ready now" />
              <MetricTile label="Reserved" dot="warning" value={String(totals.reserved)} sub="Held" />
              <MetricTile label="Repair" dot="neutral" value={String(totals.maintenance)} sub="Not rentable" />
            </MetricTiles>
          </StatCard>
        )}
      </ScreenScroll>
    </Screen>
  );
}
