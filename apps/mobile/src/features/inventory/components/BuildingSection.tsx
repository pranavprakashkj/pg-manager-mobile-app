import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "../../../components/ui/Text";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Icon } from "../../../components/ui/Icon";
import { IconButton } from "../../../components/ui/IconButton";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { fonts, useThemeColors } from "../../../theme/tokens";
import { pluralize } from "../../../utils/format";
import type { Bed, Room } from "../../../types";
import { BuildingNode, FloorNode, hasOpenBeds, occupancyRate } from "../inventory";
import { RoomCard } from "./RoomCard";

interface BuildingSectionProps {
  node: BuildingNode;
  expanded: boolean;
  /** Expand every room's bed matrix (used while filtering/searching). */
  expandAllRooms?: boolean;
  onToggle: () => void;
  onManageBuilding: () => void;
  onOpenFloor: (node: FloorNode) => void;
  onOpenRoom: (room: Room) => void;
  onOpenBed: (bed: Bed) => void;
  onAddFloor: () => void;
  onAddRoom: (node: FloorNode) => void;
}

function occupancySummary(node: BuildingNode) {
  const { counts } = node;
  return `${counts.occupied} of ${pluralize(counts.total, "bed")} occupied · ${pluralize(node.floors.length, "floor")}`;
}

function FloorHeader({ node, onPress }: { node: FloorNode; onPress: () => void }) {
  const colors = useThemeColors();
  const { counts } = node;
  const badge =
    counts.total === 0
      ? null
      : counts.vacant === 0
        ? { label: "Fully occupied", tone: "neutral" as const }
        : { label: pluralize(counts.vacant, "vacancy", "vacancies"), tone: "info" as const };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${node.floor.name}, ${pluralize(node.rooms.length, "room")}, ${pluralize(counts.total, "bed")}`}
      accessibilityHint="Opens floor details"
      onPress={onPress}
      className="min-h-[44px] flex-row items-center justify-between gap-2 active:opacity-70"
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-1">
        <Text variant="overline" tone="subtle" numberOfLines={1} className="shrink">
          {node.floor.name} · {pluralize(node.rooms.length, "room")} · {pluralize(counts.total, "bed")}
        </Text>
        <Icon name="chevron-right" size={14} color={colors.inkSubtle} />
      </View>
      {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
    </Pressable>
  );
}

/** Building accordion: header with occupancy, then floors → room cards → bed matrix. */
export function BuildingSection({
  node,
  expanded,
  expandAllRooms,
  onToggle,
  onManageBuilding,
  onOpenFloor,
  onOpenRoom,
  onOpenBed,
  onAddFloor,
  onAddRoom,
}: BuildingSectionProps) {
  const rate = occupancyRate(node.counts);
  const name = node.building.name;

  if (!expanded) {
    return (
      <Card>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: false }}
          accessibilityLabel={`${name}, ${occupancySummary(node)}`}
          accessibilityHint="Expands this building"
          onPress={onToggle}
          className="flex-row items-center gap-3"
        >
          <View className="min-w-0 flex-1">
            <Text variant="title" style={{ fontFamily: fonts.extrabold }} numberOfLines={1}>
              {name}
            </Text>
            <Text variant="caption" tone="subtle">
              {occupancySummary(node)}
            </Text>
            {node.counts.total > 0 ? (
              <View className="mt-2">
                <ProgressBar value={rate} label={`${name} occupancy`} />
              </View>
            ) : null}
          </View>
          <View pointerEvents="none">
            <IconButton icon="chevron-right" label={`Expand ${name}`} variant="outline" />
          </View>
        </Pressable>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: true }}
          accessibilityHint="Collapses this building"
          onPress={onToggle}
          className="min-w-0 flex-1"
        >
          <Text variant="title" style={{ fontFamily: fonts.extrabold }} numberOfLines={1} accessibilityRole="header">
            {name}
          </Text>
          <Text variant="caption" tone="subtle">
            {occupancySummary(node)}
          </Text>
        </Pressable>
        <IconButton icon="more" label={`Manage ${name}`} variant="outline" onPress={onManageBuilding} />
        <IconButton icon="chevron-down" label={`Collapse ${name}`} variant="outline" onPress={onToggle} />
      </View>

      {node.floors.length === 0 ? (
        <Card>
          <View className="items-start gap-3">
            <Text variant="body" tone="muted">
              No floors yet. Add a floor to start adding rooms in {name}.
            </Text>
            <Button label="Add Floor" icon="plus" size="sm" variant="secondary" onPress={onAddFloor} />
          </View>
        </Card>
      ) : (
        node.floors.map((floor) => (
          <View key={floor.floor.id} className="gap-3">
            <FloorHeader node={floor} onPress={() => onOpenFloor(floor)} />
            {floor.rooms.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onAddRoom(floor)}
                className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-border-control active:bg-surface-sunken"
              >
                <Text variant="label" tone="primary" style={{ fontSize: 13 }}>
                  + Add the first room on {floor.floor.name}
                </Text>
              </Pressable>
            ) : (
              floor.rooms.map((roomNode) => (
                <RoomCard
                  key={roomNode.room.id}
                  node={roomNode}
                  expanded={expandAllRooms || hasOpenBeds(roomNode)}
                  onPress={() => onOpenRoom(roomNode.room)}
                  onPressBed={onOpenBed}
                />
              ))
            )}
          </View>
        ))
      )}
    </View>
  );
}
