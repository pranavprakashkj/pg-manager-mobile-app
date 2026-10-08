import React from "react";
import { Pressable, View } from "react-native";
import { Card } from "../../../components/ui/Card";
import { Text } from "../../../components/ui/Text";
import { Badge } from "../../../components/ui/Badge";
import { Icon } from "../../../components/ui/Icon";
import { fonts, useThemeColors } from "../../../theme/tokens";
import { formatINRRange, pluralize } from "../../../utils/format";
import type { Bed } from "../../../types";
import { monthlyRateRange, RoomNode } from "../inventory";
import { BedGrid } from "./BedTile";

interface RoomCardProps {
  node: RoomNode;
  /** Shows the bed matrix under the summary. */
  expanded?: boolean;
  onPress: () => void;
  onPressBed?: (bed: Bed) => void;
}

/** Room summary: number, per-bed rent, occupancy pips and availability, with optional bed matrix. */
export function RoomCard({ node, expanded, onPress, onPressBed }: RoomCardProps) {
  const colors = useThemeColors();
  const { room, beds, counts } = node;
  const rate = monthlyRateRange(beds);
  const availability =
    counts.total === 0
      ? "No beds set up"
      : counts.vacant === 0
        ? "Fully occupied"
        : pluralize(counts.vacant, "vacancy", "vacancies");

  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Room ${room.roomNumber}, ${counts.occupied} of ${counts.total} beds occupied, ${availability}`}
        accessibilityHint="Opens room details"
        onPress={onPress}
        className="gap-3 active:opacity-80"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text variant="card-title" numberOfLines={1}>
              Room {room.roomNumber}
            </Text>
            {rate ? (
              <Text variant="card-title" tone="primary" style={{ fontVariant: ["tabular-nums"] }}>
                {formatINRRange(rate.min, rate.max)}
                <Text variant="micro" tone="subtle" style={{ fontFamily: fonts.semibold }}>
                  {" "}/bed /mo
                </Text>
              </Text>
            ) : (
              <Text variant="caption" tone="subtle">
                Add beds to set rent
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-1">
            <Badge
              label={`${counts.occupied}/${counts.total} occupied`}
              tone={counts.total > 0 && counts.vacant === 0 ? "neutral" : "info"}
            />
            <Icon name="chevron-right" size={18} color={colors.inkSubtle} />
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row flex-wrap items-center gap-1" importantForAccessibility="no-hide-descendants">
            {beds.map((b) => (
              <View
                key={b.id}
                className="h-2 w-2 rounded-full"
                style={
                  b.status === "vacant"
                    ? { borderWidth: 1.5, borderColor: colors.borderControl }
                    : { backgroundColor: b.status === "occupied" ? colors.accent : colors.warning }
                }
              />
            ))}
          </View>
          <Text variant="label" tone={counts.vacant ? "primary" : "muted"}>
            {availability}
          </Text>
        </View>
      </Pressable>
      {expanded && beds.length > 0 ? (
        <View className="mt-3">
          <BedGrid beds={beds} onPressBed={onPressBed} />
        </View>
      ) : null}
    </Card>
  );
}
