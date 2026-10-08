import { bedRepository } from "../bedRepository";
import { roomRepository } from "../../rooms/roomRepository";
import { buildingRepository } from "../../buildings/buildingRepository";
import { floorRepository } from "../../floors/floorRepository";
import { addDoc, getDocs, updateDoc, getDoc } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "mock-collection"),
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

jest.mock("../../rooms/roomRepository", () => ({
  roomRepository: { findById: jest.fn() },
}));

jest.mock("../../../lib/firebase/config", () => ({ db: {} }));

describe("bedRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a bed defaulting to vacant", async () => {
      (roomRepository.findById as jest.Mock).mockResolvedValue({ isActive: true,
      organizationId: "org123", floorId: "f1", buildingId: "b1" });
      (floorRepository.findById as jest.Mock).mockResolvedValue({ isActive: true,
      organizationId: "org123", buildingId: "b1" });
      (buildingRepository.findById as jest.Mock).mockResolvedValue({ isActive: true });
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      (addDoc as jest.Mock).mockResolvedValue({ id: "bed1" });

      await bedRepository.create("org123", "b1", "f1", "r1", { name: "Bed A", defaultMonthlyRate: 1000, defaultDailyRate: 100 });
      expect(addDoc).toHaveBeenCalledWith("mock-collection", expect.objectContaining({ status: "vacant" }));
    });

    it("rejects nonexistent room", async () => {
      (roomRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(bedRepository.create("org123", "b1", "f1", "r1", { name: "A", defaultMonthlyRate: 100, defaultDailyRate: 10 })).rejects.toThrow("nonexistent room");
    });
    
    it("rejects duplicate active bed name", async () => {
      (roomRepository.findById as jest.Mock).mockResolvedValue({ isActive: true,
      organizationId: "org123", floorId: "f1", buildingId: "b1" });
      (floorRepository.findById as jest.Mock).mockResolvedValue({ isActive: true,
      organizationId: "org123", buildingId: "b1" });
      (buildingRepository.findById as jest.Mock).mockResolvedValue({ isActive: true });
      (getDocs as jest.Mock).mockResolvedValue({ docs: [{ data: () => ({ name: "A" }), id: "dup" }] });
      
      await expect(bedRepository.create("org123", "b1", "f1", "r1", { name: "A", defaultMonthlyRate: 100, defaultDailyRate: 10 })).rejects.toThrow("already exists");
    });
  });

  describe("deactivate", () => {
    it("blocked when bed is occupied", async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({ status: "occupied", organizationId: "org123" }), id: "bed1" });
      await expect(bedRepository.deactivate("org123", "bed1")).rejects.toThrow("Cannot deactivate an occupied bed");
    });

    it("allows deactivation if vacant", async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({ status: "vacant", organizationId: "org123" }), id: "bed1" });
      await bedRepository.deactivate("org123", "bed1");
      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
