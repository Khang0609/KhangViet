import {
  initialLandingContent,
  initialLeads,
  initialUsers,
} from "@khangviet/data";
import type {
  LandingContent,
  ContactLead,
  PendingChange,
  User,
} from "@khangviet/types";

class MockMemoryStore {
  public landing: LandingContent = JSON.parse(
    JSON.stringify(initialLandingContent)
  );
  public leads: ContactLead[] = JSON.parse(JSON.stringify(initialLeads));
  public users: User[] = JSON.parse(JSON.stringify(initialUsers));
  public pendingChanges: PendingChange[] = [];

  reset() {
    this.landing = JSON.parse(JSON.stringify(initialLandingContent));
    this.leads = JSON.parse(JSON.stringify(initialLeads));
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.pendingChanges = [];
  }
}

export const mockStore = new MockMemoryStore();
