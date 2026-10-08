import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { Bed, BedStatus, Room } from "../../../types";
import { RoomCard } from "../components/RoomCard";
import { countBeds, RoomNode } from "../inventory";

const ts = new Date(0);
const room: Room = {
  id: "r101", organizationId: "org1", buildingId: "b1", floorId: "f1", roomNumber: "101",
  isActive: true, createdAt: ts, updatedAt: ts,
};
const bed = (id: string, name: string, status: BedStatus, rate = 8500): Bed => ({
  id, organizationId: "org1", buildingId: "b1", floorId: "f1", roomId: "r101", name, status,
  defaultMonthlyRate: rate, defaultDailyRate: 500, isActive: true, createdAt: ts, updatedAt: ts,
});
const node = (beds: Bed[]): RoomNode => ({ room, beds, counts: countBeds(beds) });

describe("RoomCard", () => {
  const mixed = node([
    bed("a", "Bed A", "occupied"),
    bed("b", "Bed B", "vacant", 9000),
    bed("c", "Bed C", "reserved"),
    bed("d", "Bed D", "maintenance"),
  ]);

  it("summarises occupancy, rent range and availability", async () => {
    await render(<RoomCard node={mixed} onPress={() => {}} />);
    expect(screen.getByText("Room 101")).toBeTruthy();
    expect(screen.getByText("1/4 occupied")).toBeTruthy();
    expect(screen.getByText("1 vacancy")).toBeTruthy();
    expect(screen.getByText(/₹8,500–₹9,000/)).toBeTruthy();
  });

  it("shows the bed matrix with V2 labels (Ready, Repair) only when expanded", async () => {
    const { rerender } = await render(<RoomCard node={mixed} onPress={() => {}} />);
    expect(screen.queryByText("Ready")).toBeNull();
    await rerender(<RoomCard node={mixed} expanded onPress={() => {}} />);
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("Repair")).toBeTruthy();
    expect(screen.getByText("Reserved")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bed D, Repair" })).toBeTruthy();
  });

  it("opens the room and individual beds", async () => {
    const onPress = jest.fn();
    const onPressBed = jest.fn();
    await render(<RoomCard node={mixed} expanded onPress={onPress} onPressBed={onPressBed} />);
    await fireEvent.press(screen.getByRole("button", { name: /Room 101, 1 of 4 beds occupied/ }));
    await fireEvent.press(screen.getByRole("button", { name: "Bed B, Vacant" }));
    expect(onPress).toHaveBeenCalled();
    expect(onPressBed).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
  });

  it("reports full and empty rooms", async () => {
    const { rerender } = await render(<RoomCard node={node([bed("a", "Bed A", "occupied")])} onPress={() => {}} />);
    expect(screen.getByText("Fully occupied")).toBeTruthy();
    await rerender(<RoomCard node={node([])} onPress={() => {}} />);
    expect(screen.getByText("No beds set up")).toBeTruthy();
    expect(screen.getByText("Add beds to set rent")).toBeTruthy();
  });
});
