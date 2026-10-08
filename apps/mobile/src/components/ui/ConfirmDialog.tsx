import React, { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { Button } from "./Button";
import { useThemeColors } from "../../theme/tokens";

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: IconName;
  /** May return a promise; the sheet then shows progress until it settles. */
  onConfirm: () => void | Promise<unknown>;
}

interface ConfirmDialogState {
  current: ConfirmDialogOptions | null;
  show: (options: ConfirmDialogOptions) => void;
  hide: () => void;
}

const useConfirmDialogStore = create<ConfirmDialogState>((set) => ({
  current: null,
  show: (current) => set({ current }),
  hide: () => set({ current: null }),
}));

/** Opens the V2 confirmation bottom sheet. Requires <ConfirmDialogHost /> at the root. */
export function showConfirmDialog(options: ConfirmDialogOptions) {
  useConfirmDialogStore.getState().show(options);
}

export function ConfirmDialogHost() {
  const current = useConfirmDialogStore((s) => s.current);
  const hide = useConfirmDialogStore((s) => s.hide);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [busy, setBusy] = useState(false);

  if (!current) return null;

  const {
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    icon,
    onConfirm,
  } = current;

  const close = () => {
    if (!busy) hide();
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      hide();
    }
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <View className="flex-1 justify-end" style={{ backgroundColor: colors.scrim }}>
        <Pressable accessibilityLabel="Dismiss" className="flex-1" onPress={close} />
        <View
          accessibilityViewIsModal
          className="gap-3 rounded-t-xl bg-surface-card px-4 pt-3"
          style={{ paddingBottom: 24 + insets.bottom }}
        >
          <View className="mb-1 h-1 w-10 self-center rounded-full bg-border-control" />
          <View
            className={`h-11 w-11 items-center justify-center rounded-full ${destructive ? "bg-danger-soft" : "bg-primary-soft"}`}
          >
            <Icon
              name={icon ?? (destructive ? "alert" : "info")}
              size={22}
              color={destructive ? colors.dangerInk : colors.primarySoftInk}
            />
          </View>
          <Text variant="title-md" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="body" tone="muted">
            {message}
          </Text>
          <View className="mt-2 gap-2">
            <Button
              label={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              size="lg"
              block
              loading={busy}
              onPress={confirm}
            />
            <Button label={cancelLabel} variant="ghost" block disabled={busy} onPress={close} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
