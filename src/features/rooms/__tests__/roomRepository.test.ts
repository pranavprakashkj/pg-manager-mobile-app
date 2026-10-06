import { roomRepository } from "../roomRepository";
import { buildingRepository } from "../../buildings/buildingRepository";
import { floorRepository } from "../../floors/floorRepository";
import { bedRepository } from "../../beds/bedRepository";
import { addDoc, getDocs, updateDoc } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => "timestamp"),
}));

jest.mock("../../buildings/buildingRepository", () => ({
  buildingRepository: { findById: jest.fn() },
}));

jest.mock("../../floors/floorRepository", () => ({
  floorRepository: { findById: jest.fn() },
}));

jest.mock("../../beds/bedRepository", () => ({
  bedRepository: { getByRoomId: jest.fn() },
}));

jest.mock("../../../lib/firebase/config", () => ({ db: {} }));

describe("roomRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a room when valid", async () => {
      (floorRepository.findById as jest.Mock).mockResolvedValue({ isActive: true, buildingId: "b1" });
      (buildingRepository.findById as jest.Mock).mockResolvedValue({ isActive: true });
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] }); // no duplicates
      (addDoc as jest.Mock).mockResolvedValue({ id: "r1" });

      const id = await roomRepository.create("b1", "f1", { roomNumber: "101" });
      expect(id).toBe("r1");
    });

    it("rejects nonexistent floor", async () => {
      (floorRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(roomRepository.create("b1", "f1", { roomNumber: "101" })).rejects.toThrow("nonexistent floor");
    });

    it("rejects inactive floor", async () => {
      (floorRepository.findById as jest.Mock).mockResolvedValue({ isActive: false });
      await expect(roomRepository.create("b1", "f1", { roomNumber: "101" })).rejects.toThrow("inactive floor");
    });

    it("rejects floor belonging to another building", async () => {
      (floorRepository.findById as jest.Mock).mockResolvedValue({ isActive: true, buildingId: "b2" });
      await expect(roomRepository.create("b1", "f1", { roomNumber: "101" })).rejects.toThrow("does not belong to the specified building");
    });

    it("rejects duplicate room number", async () => {
      (floorRepository.findById as jest.Mock).mockResolvedValue({ isActive: true, buildingId: "b1" });
      (buildingRepository.findById as jest.Mock).mockResolvedValue({ isActive: true });
      (getDocs as jest.Mock).mockResolvedValue({ docs: [{ data: () => ({ roomNumber: "101" }), id: "dup" }] });
      
      await expect(roomRepository.create("b1", "f1", { roomNumber: "101" })).rejects.toThrow("already exists");
    });
  });

  describe("deactivate", () => {
    it("deactivates when no active beds", async () => {
      (bedRepository.getByRoomId as jest.Mock).mockResolvedValue([]);
      await roomRepository.deactivate("r1");
      expect(updateDoc).toHaveBeenCalled();
    });

    it("blocked when active beds exist", async () => {
      (bedRepository.getByRoomId as jest.Mock).mockResolvedValue([{ id: "bed1" }]);
      await expect(roomRepository.deactivate("r1")).rejects.toThrow("active beds");
    });
  });
});
