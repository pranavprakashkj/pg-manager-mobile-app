import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { AppBar } from "./AppBar";
import { Button } from "./Button";
import { Card } from "./Card";
import { BottomActionBar, FormScreen, ScreenScroll } from "./Screen";
import { Text } from "./Text";

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  /** Heading inside the card, e.g. "Room details". */
  sectionTitle?: string;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: () => void;
  children: React.ReactNode;
  /** Extra content below the main card (e.g. a hint banner). */
  footer?: React.ReactNode;
}

/** V2 form screen: app bar, fields in a card, sticky primary action + Cancel. */
export function FormLayout({
  title,
  subtitle,
  sectionTitle,
  submitLabel,
  submitting,
  onSubmit,
  children,
  footer,
}: FormLayoutProps) {
  return (
    <FormScreen>
      <AppBar title={title} subtitle={subtitle} back />
      <ScreenScroll>
        <Card>
          <View className="gap-4">
            {sectionTitle ? <Text variant="card-title">{sectionTitle}</Text> : null}
            {children}
          </View>
        </Card>
        {footer}
      </ScreenScroll>
      <BottomActionBar>
        <Button label={submitLabel} icon="check" size="lg" block loading={submitting} onPress={onSubmit} />
        <Button label="Cancel" variant="ghost" block disabled={submitting} onPress={() => router.back()} />
      </BottomActionBar>
    </FormScreen>
  );
}
