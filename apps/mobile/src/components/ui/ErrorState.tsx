import React from "react";
import { View } from "react-native";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";

interface ErrorStateProps {
  /** Short, user-facing headline, e.g. "Couldn't load rooms". */
  title?: string;
  /** Friendly explanation — pass getErrorMessage(error), never raw backend text. */
  message: string;
  onRetry?: () => void;
}

/** Full-screen load failure with a retry action. */
export function ErrorState({ title = "Couldn't load this screen", message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 justify-center p-4">
      <Card>
        <EmptyState
          tone="danger"
          icon="alert"
          title={title}
          message={message}
          action={onRetry ? "Try Again" : undefined}
          actionIcon="refresh"
          onAction={onRetry}
        />
      </Card>
    </View>
  );
}
