import React, { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";
import { Text } from "./Text";
import { Icon } from "./Icon";
import { useThemeColors } from "../../theme/tokens";

type ToastTone = "success" | "error";

interface ToastState {
  message: string | null;
  tone: ToastTone;
  id: number;
  show: (message: string, tone: ToastTone) => void;
  hide: (id: number) => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: null,
  tone: "success",
  id: 0,
  show: (message, tone) => set((s) => ({ message, tone, id: s.id + 1 })),
  hide: (id) => set((s) => (s.id === id ? { message: null } : s)),
}));

/** Brief confirmation that replaces blocking "Success" alerts. */
export function showToast(message: string, tone: ToastTone = "success") {
  useToastStore.getState().show(message, tone);
}

const DURATION_MS = 2600;

export function ToastHost() {
  const { message, tone, id, hide } = useToastStore();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => hide(id), DURATION_MS);
    return () => clearTimeout(t);
  }, [message, id, hide]);

  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute left-4 right-4 items-center"
      style={{ bottom: insets.bottom + 84 }}
    >
      <View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        className="max-w-[358px] flex-row items-center gap-3 rounded-md bg-ink px-4 py-3"
      >
        <Icon
          name={tone === "error" ? "alert-circle" : "check-circle"}
          size={20}
          color={colors.surfaceCard}
        />
        <Text variant="body-strong" tone="inherit" className="shrink text-surface-card">
          {message}
        </Text>
      </View>
    </View>
  );
}
