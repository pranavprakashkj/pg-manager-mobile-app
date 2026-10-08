import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { Badge } from "../Badge";

describe("Button", () => {
  it("renders its label and handles presses", async () => {
    const onPress = jest.fn();
    await render(<Button label="Add Room" icon="plus" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Add Room" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire while disabled or loading", async () => {
    const onPress = jest.fn();
    const { rerender } = await render(<Button label="Save" disabled onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Save" }));
    await rerender(<Button label="Save" loading onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Save" }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save" }).props.accessibilityState).toMatchObject({ disabled: true, busy: true });
  });
});

describe("EmptyState", () => {
  it("shows copy and wires primary and secondary actions", async () => {
    const onAction = jest.fn();
    const onSecondary = jest.fn();
    await render(
      <EmptyState
        tone="search"
        title="No matches found"
        message="Clear filters to see all rooms."
        action="Clear search & filters"
        onAction={onAction}
        secondaryAction="Add Room"
        onSecondary={onSecondary}
      />
    );
    expect(screen.getByText("No matches found")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Clear search & filters" }));
    await fireEvent.press(screen.getByRole("button", { name: "Add Room" }));
    expect(onAction).toHaveBeenCalled();
    expect(onSecondary).toHaveBeenCalled();
  });
});

describe("Badge", () => {
  it("always renders a text label alongside color", async () => {
    await render(<Badge label="2 vacancies" tone="info" dot />);
    expect(screen.getByText("2 vacancies")).toBeTruthy();
  });
});
