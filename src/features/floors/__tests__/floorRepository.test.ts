import { floorRepository } from "../floorRepository";
import { buildingRepository } from "../../buildings/buildingRepository";
import { addDoc } from "firebase/firestore";

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
  buildingRepository: {
    getById: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../../../lib/firebase/config", () => ({
  db: {},
}));

describe("floorRepository", () => {
  describe("create", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("creates a floor when building exists and is active", async () => {
      (buildingRepository.findById as jest.Mock).mockResolvedValue({ isActive: true });
      (addDoc as jest.Mock).mockResolvedValue({ id: "floor-1" });

      const result = await floorRepository.create("org123", "b-1", { name: "F1" }, 0);

      expect(result).toBe("floor-1");
      expect(buildingRepository.findById).toHaveBeenCalledWith("org123", "b-1");
      expect(addDoc).toHaveBeenCalled();
    });

    it("fails when building does not exist", async () => {
      (buildingRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(floorRepository.create("org123", "b-1", { name: "F1" }, 0)).rejects.toThrow("Cannot add floor to a nonexistent building");
      expect(addDoc).not.toHaveBeenCalled();
    });

    it("fails when building is inactive", async () => {
      (buildingRepository.findById as jest.Mock).mockResolvedValue({ isActive: false });

      await expect(floorRepository.create("org123", "b-1", { name: "F1" }, 0)).rejects.toThrow("Cannot add floor to an inactive building");
      expect(addDoc).not.toHaveBeenCalled();
    });
  });
});
