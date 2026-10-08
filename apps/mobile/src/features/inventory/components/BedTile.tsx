import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "../../../components/ui/Text";
import { Icon, IconName } from "../../../components/ui/Icon";
import { fonts, useThemeColors } from "../../../theme/tokens";
import type { Bed, BedStatus } from "../../../types";
import { bedCode } from "../inventory";
import { bedStatusLabel } from "../bedStatus";

const statusIcon: Record<BedStatus, IconName> = {
  occupied: "check-circle",
  vacant: "check",
  reserved: "clock",
  maintenance: "wrench",
};

interface BedTileProps {
  bed: Bed;
  /** Secondary line; defaults to the status label. */
  sub?: string;
  onPress?: () => void;
}

/** Bed matrix cell. Vacant beds are filled with the brand color so they stand out when scanning. */
export function BedTile({ bed, sub, onPress }: BedTileProps) {
  const colors = useThemeColors();
  const s = bed.status;

  const box = {
    occupied: "bg-surface-sunken",
    vacant: "bg-primary",
    reserved: "bg-warning-soft",
    maintenance: "bg-neutral-soft",
  }[s];

  const title = s === "vacant" ? "Vacant" : s === "maintenance" ? "Repair" : bed.name;
  const subText = sub ?? (s === "vacant" ? "Ready" : s === "maintenance" ? "Not rentable" : bedStatusLabel[s]);
  const subColor = s === "vacant" ? colors.onPrimary : s === "reserved" ? colors.warningInk : colors.inkSubtle;
  const trailColor = s === "occupied" ? colors.success : subColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${bed.name}, ${bedStatusLabel[s]}`}
      onPress={onPress}
      disabled={!onPress}
      className={`min-h-[52px] w-full min-w-0 flex-row items-center gap-2 rounded-md p-2 active:opacity-80 ${box}`}
    >
      <View
        className={`h-7 w-7 items-center justify-center rounded-full ${
          s === "vacant" ? "bg-on-primary" : "border border-border bg-surface-card"
        }`}
      >
        <Text
          variant="caption"
          tone="inherit"
          style={{ fontFamily: fonts.extrabold, fontSize: 11, lineHeight: 13, color: s === "vacant" ? colors.primary : colors.ink }}
        >
          {bedCode(bed.name)}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text
          variant="label"
          tone="inherit"
          numberOfLines={1}
          style={{ fontFamily: fonts.bold, color: s === "vacant" ? colors.onPrimary : s === "maintenance" ? colors.inkMuted : colors.ink }}
        >
          {title}
        </Text>
        <Text variant="micro" tone="inherit" numberOfLines={1} style={{ color: subColor }}>
          {subText}
        </Text>
      </View>
      <Icon name={statusIcon[s]} size={16} color={trailColor} />
    </Pressable>
  );
}

/** Two-column bed matrix. */
export function BedGrid({ beds, onPressBed }: { beds: Bed[]; onPressBed?: (bed: Bed) => void }) {
  const rows: Bed[][] = [];
  for (let i = 0; i < beds.length; i += 2) rows.push(beds.slice(i, i + 2));
  return (
    <View className="gap-2">
      {rows.map((row) => (
        <View key={row[0].id} className="flex-row gap-2">
          {row.map((bed) => (
            <View key={bed.id} className="min-w-0 flex-1">
              <BedTile bed={bed} onPress={onPressBed ? () => onPressBed(bed) : undefined} />
            </View>
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
