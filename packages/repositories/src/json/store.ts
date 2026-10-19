import { initialLandingContent, initialLeads } from "@khangviet/data";
import type { LandingContent, ContactLead, PendingChange } from "@khangviet/types";

class MockMemoryStore {
  public landing: LandingContent = JSON.parse(
    JSON.stringify(initialLandingContent)
  );
  public leads: ContactLead[] = JSON.parse(JSON.stringify(initialLeads));
  public pendingChanges: PendingChange[] = [];

  reset() {
    this.landing = JSON.parse(JSON.stringify(initialLandingContent));
    this.leads = JSON.parse(JSON.stringify(initialLeads));
    this.pendingChanges = [];
  }
}

export const mockStore = new MockMemoryStore();
