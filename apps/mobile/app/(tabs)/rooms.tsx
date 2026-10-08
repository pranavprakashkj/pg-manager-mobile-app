import React, { useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { AppBar } from "../../src/components/ui/AppBar";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { FilterChips } from "../../src/components/ui/FilterChips";
import { IconButton } from "../../src/components/ui/IconButton";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { Screen, ScreenScroll } from "../../src/components/ui/Screen";
import { SearchField } from "../../src/components/ui/SearchField";
import { Text } from "../../src/components/ui/Text";
import { useInventory } from "../../src/features/inventory/hooks";
import {
  countRoomsByFilter,
  filterInventory,
  InventoryFilter,
  occupancyRate,
  totalCounts,
  totalRooms,
} from "../../src/features/inventory/inventory";
import { BuildingSection } from "../../src/features/inventory/components/BuildingSection";
import { useOrganization } from "../../src/features/organizations/hooks";
import { useOrganizationStore } from "../../src/stores/organizationStore";
import { useThemeColors } from "../../src/theme/tokens";
import { getErrorMessage } from "../../src/utils/errorUtils";
import { pluralize } from "../../src/utils/format";

export default function Rooms() {
  const colors = useThemeColors();
  const { activeOrganizationId, memberships, setActiveOrganizationId } = useOrganizationStore();
  const { data: organization } = useOrganization(activeOrganizationId);
  const { tree, isLoading, isError, error, isRefetching, refetch } = useInventory();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InventoryFilter>("all");
  // Explicit user toggles; buildings default to expanded only for the first one.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const totals = useMemo(() => (tree ? totalCounts(tree) : null), [tree]);
  const chipCounts = useMemo(() => (tree ? countRoomsByFilter(tree) : null), [tree]);
  const visible = useMemo(() => (tree ? filterInventory(tree, { filter, query }) : []), [tree, filter, query]);
  const isNarrowed = filter !== "all" || query.trim().length > 0;

  const orgName = organization?.name ?? "Your organization";
  const subtitle = tree && totals ? `${orgName} · ${pluralize(tree.length, "building")} · ${pluralize(totals.total, "bed")}` : orgName;

  const switchAction =
    memberships.length > 1 ? (
      <IconButton icon="swap" label="Switch organization" onPress={() => setActiveOrganizationId(null)} />
    ) : null;

  const header = <AppBar large title="Rooms" subtitle={subtitle} actions={switchAction} />;

  if (isLoading) {
    return (
      <Screen>
        {header}
        <LoadingState message="Loading rooms" withSummary />
      </Screen>
    );
  }

  if (isError || !tree || !totals || !chipCounts) {
    return (
      <Screen>
        {header}
        <ErrorState title="Couldn't load rooms" message={getErrorMessage(error)} onRetry={refetch} />
      </Screen>
    );
  }

  if (tree.length === 0) {
    return (
      <Screen>
        {header}
        <View className="flex-1 justify-center p-4">
          <Card>
            <EmptyState
              icon="building"
              title="Add your first building"
              message="Set up buildings, floors, rooms and beds once. Guests and rent build on it."
              action="Add Building"
              actionIcon="plus"
              onAction={() => router.push("/building/add")}
            />
          </Card>
        </View>
      </Screen>
    );
  }

  const rate = occupancyRate(totals);
  const pulseEnd = [
    `${totals.vacant} vacant`,
    totals.reserved ? `${totals.reserved} reserved` : null,
    totals.maintenance ? `${totals.maintenance} repair` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const isExpanded = (id: string, index: number) => (isNarrowed ? true : toggled[id] ?? index === 0);

  return (
    <Screen>
      {header}
      <ScreenScroll
        bottomInset={32}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <SearchField value={query} onChangeText={setQuery} placeholder="Search building, floor, room or bed…" />
        <FilterChips
          label="Room filters"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: chipCounts.all },
            { value: "vacant", label: "Vacant", count: chipCounts.vacant },
            { value: "reserved", label: "Reserved", count: chipCounts.reserved, tone: "warning" },
            { value: "maintenance", label: "Repair", count: chipCounts.maintenance },
          ]}
        />

        <Card>
          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <View>
                <Text variant="overline" tone="subtle">
                  Inventory pulse
                </Text>
                <Text variant="title-lg">{totals.total ? `${rate}% occupancy` : "No beds yet"}</Text>
              </View>
              <Badge label={`${totals.occupied} of ${pluralize(totals.total, "bed")}`} tone="info" />
            </View>
            <ProgressBar
              value={rate}
              label="Occupancy"
              startLabel={`${pluralize(tree.length, "building")} · ${pluralize(totalRooms(tree), "room")}`}
              endLabel={pulseEnd}
            />
            <View className="flex-row gap-2">
              <Button
                label="Add Room"
                icon="plus"
                size="sm"
                className="flex-1"
                onPress={() => router.push("/floor/add-room")}
              />
              <Button
                label="Add Building"
                icon="building"
                size="sm"
                variant="outline"
                className="flex-1"
                onPress={() => router.push("/building/add")}
              />
            </View>
          </View>
        </Card>

        {visible.length === 0 ? (
          <Card>
            <EmptyState
              tone="search"
              eyebrow={[query.trim() ? `Search: "${query.trim()}"` : null, filter !== "all" ? filterLabel(filter) : null]
                .filter(Boolean)
                .join(" · ")}
              title="No matches found"
              message={`Nothing matches in ${orgName}. Check the spelling, or clear filters to see all ${pluralize(
                chipCounts.all,
                "room"
              )}.`}
              action="Clear search & filters"
              actionIcon="x"
              onAction={() => {
                setQuery("");
                setFilter("all");
              }}
            />
          </Card>
        ) : (
          visible.map((node, index) => (
            <BuildingSection
              key={node.building.id}
              node={node}
              expanded={isExpanded(node.building.id, index)}
              expandAllRooms={isNarrowed}
              onToggle={() =>
                setToggled((t) => ({ ...t, [node.building.id]: !isExpanded(node.building.id, index) }))
              }
              onManageBuilding={() =>
                router.push({ pathname: "/building/[id]", params: { id: node.building.id, name: node.building.name } })
              }
              onAddFloor={() =>
                router.push({
                  pathname: "/building/add-floor",
                  params: { buildingId: node.building.id, buildingName: node.building.name },
                })
              }
              onOpenFloor={(f) =>
                router.push({
                  pathname: "/floor/[id]",
                  params: { id: f.floor.id, name: f.floor.name, buildingId: f.floor.buildingId },
                })
              }
              onAddRoom={(f) =>
                router.push({ pathname: "/floor/add-room", params: { floorId: f.floor.id, buildingId: f.floor.buildingId } })
              }
              onOpenRoom={(room) =>
                router.push({
                  pathname: "/room/[id]",
                  params: { id: room.id, roomNumber: room.roomNumber, floorId: room.floorId, buildingId: room.buildingId },
                })
              }
              onOpenBed={(bed) =>
                router.push({
                  pathname: "/room/[id]",
                  params: { id: bed.roomId, floorId: bed.floorId, buildingId: bed.buildingId },
                })
              }
            />
          ))
        )}
      </ScreenScroll>
    </Screen>
  );
}

function filterLabel(filter: InventoryFilter): string {
  return { all: "All", vacant: "Vacant", reserved: "Reserved", maintenance: "Repair" }[filter];
}
