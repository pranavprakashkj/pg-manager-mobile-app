import { useOrganizationStore } from "../organizationStore";
import { organizationMemberRepository } from "../../features/organizations/organizationMemberRepository";

// jest.mock calls are hoisted above the imports by babel-jest.
jest.mock("../../lib/firebase/config", () => ({ auth: {}, db: {} }));
jest.mock("firebase/firestore", () => ({}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
jest.mock("../../features/organizations/organizationMemberRepository");

const getByUserId = organizationMemberRepository.getByUserId as jest.Mock;

describe("organizationStore state machine", () => {
  beforeEach(() => {
    useOrganizationStore.getState().clearMemberships();
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("1. authenticated user with 0 memberships -> onboarding_required", async () => {
    getByUserId.mockResolvedValue([]);

    await useOrganizationStore.getState().loadMemberships("user1");

    const state = useOrganizationStore.getState();
    expect(state.selectionState).toBe("onboarding_required");
    expect(state.activeOrganizationId).toBeNull();
  });

  it("2. authenticated user with exactly 1 active membership -> selected", async () => {
    getByUserId.mockResolvedValue([
      { organizationId: "org1", userId: "user1", role: "owner", status: "active" }
    ]);

    await useOrganizationStore.getState().loadMemberships("user1");

    const state = useOrganizationStore.getState();
    expect(state.selectionState).toBe("selected");
    expect(state.activeOrganizationId).toBe("org1");
  });

  it("3. authenticated user with 2+ memberships and no valid persisted selection -> selection_required", async () => {
    getByUserId.mockResolvedValue([
      { organizationId: "org1", userId: "user1", role: "owner", status: "active" },
      { organizationId: "org2", userId: "user1", role: "admin", status: "active" }
    ]);

    await useOrganizationStore.getState().loadMemberships("user1");

    const state = useOrganizationStore.getState();
    expect(state.selectionState).toBe("selection_required");
    expect(state.activeOrganizationId).toBeNull();
  });

  it("4. authenticated user with 2+ memberships and valid persisted selection -> selected", async () => {
    // Simulate persisted state
    useOrganizationStore.setState({ activeOrganizationId: "org2" });

    getByUserId.mockResolvedValue([
      { organizationId: "org1", userId: "user1", role: "owner", status: "active" },
      { organizationId: "org2", userId: "user1", role: "admin", status: "active" }
    ]);

    await useOrganizationStore.getState().loadMemberships("user1");

    const state = useOrganizationStore.getState();
    expect(state.selectionState).toBe("selected");
    expect(state.activeOrganizationId).toBe("org2");
  });

  it("5. persisted organization that is no longer an active membership -> cleared -> selection_required", async () => {
    // Simulate persisted state to org3 (which the user is no longer a part of)
    useOrganizationStore.setState({ activeOrganizationId: "org3" });

    getByUserId.mockResolvedValue([
      { organizationId: "org1", userId: "user1", role: "owner", status: "active" },
      { organizationId: "org2", userId: "user1", role: "admin", status: "active" }
    ]);

    await useOrganizationStore.getState().loadMemberships("user1");

    const state = useOrganizationStore.getState();
    expect(state.selectionState).toBe("selection_required");
    expect(state.activeOrganizationId).toBeNull(); // Cleared
  });

  it("6. a failed load is an error, never onboarding — and keeps the persisted selection", async () => {
    useOrganizationStore.setState({ activeOrganizationId: "org2" });
    getByUserId.mockRejectedValue(Object.assign(new Error("offline"), { code: "unavailable" }));

    await useOrganizationStore.getState().loadMemberships("user1");

    const state = useOrganizationStore.getState();
    expect(state.selectionState).toBe("loading");
    expect(state.selectionState).not.toBe("onboarding_required");
    expect(state.membershipsError).toBeTruthy();
    expect(state.isLoadingMemberships).toBe(false);
    expect(state.activeOrganizationId).toBe("org2");
  });

  it("7. retrying after a failure clears the error and resolves normally", async () => {
    useOrganizationStore.setState({ activeOrganizationId: "org2" });
    getByUserId.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([
      { organizationId: "org1", userId: "user1", role: "owner", status: "active" },
      { organizationId: "org2", userId: "user1", role: "admin", status: "active" },
    ]);

    await useOrganizationStore.getState().loadMemberships("user1");
    await useOrganizationStore.getState().loadMemberships("user1");

    const state = useOrganizationStore.getState();
    expect(state.membershipsError).toBeNull();
    expect(state.selectionState).toBe("selected");
    expect(state.activeOrganizationId).toBe("org2");
  });

  it("8. switching organization (clearing the selection) requires an explicit choice", async () => {
    getByUserId.mockResolvedValue([
      { organizationId: "org1", userId: "user1", role: "owner", status: "active" },
      { organizationId: "org2", userId: "user1", role: "admin", status: "active" },
    ]);
    useOrganizationStore.setState({ activeOrganizationId: "org1" });
    await useOrganizationStore.getState().loadMemberships("user1");

    useOrganizationStore.getState().setActiveOrganizationId(null);

    const state = useOrganizationStore.getState();
    expect(state.selectionState).toBe("selection_required");
    expect(state.activeOrganizationId).toBeNull();
  });
});
