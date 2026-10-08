import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Page background for every screen. */
export function Screen({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 bg-surface-page">{children}</View>;
}

interface ScreenScrollProps extends ScrollViewProps {
  /** Extra bottom space so content clears a sticky action bar or FAB. */
  bottomInset?: number;
  gap?: number;
}

/** Scrollable content area with the 16px gutter and section gap. */
export function ScreenScroll({ children, bottomInset = 24, gap = 16, contentContainerStyle, ...props }: ScreenScrollProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ padding: 16, paddingBottom: bottomInset, gap }, contentContainerStyle]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

/** Keyboard-aware wrapper for form screens. */
export function FormScreen({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-page"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

/** Sticky bottom action area on the card surface (primary action within thumb reach). */
export function BottomActionBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="gap-1 border-t border-border bg-surface-card px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
    >
      {children}
    </View>
  );
}
