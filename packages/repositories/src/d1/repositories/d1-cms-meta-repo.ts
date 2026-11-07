import { eq } from "drizzle-orm";
import { initialLandingContent } from "@khangviet/data";
import type {
  HeroSlide,
  CompanyLegalInfo,
  PendingChange,
  ChangeActionType,
  SyncStatus,
} from "@khangviet/types";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import {
  cmsMetadataTable,
  pendingChangesTable,
} from "../schema/cms.schema";

export class D1CmsMetaRepo {
  constructor(private readonly client: D1Client) {}

  async getHeroSlides(): Promise<HeroSlide[]> {
    const row = await this.client
      .select()
      .from(cmsMetadataTable)
      .where(eq(cmsMetadataTable.key, "hero_slides"))
      .limit(1);
    return row[0]
      ? JSON.parse(row[0].valueJson)
      : initialLandingContent.heroSlides;
  }

  async setHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    const now = new Date().toISOString();
    await this.client
      .insert(cmsMetadataTable)
      .values({ key: "hero_slides", valueJson: JSON.stringify(slides), updatedAt: now })
      .onConflictDoUpdate({
        target: cmsMetadataTable.key,
        set: { valueJson: JSON.stringify(slides), updatedAt: now },
      });
    return slides;
  }

  async getLegalInfo(): Promise<CompanyLegalInfo> {
    const row = await this.client
      .select()
      .from(cmsMetadataTable)
      .where(eq(cmsMetadataTable.key, "legal_info"))
      .limit(1);
    return row[0]
      ? JSON.parse(row[0].valueJson)
      : initialLandingContent.companyLegalInfo;
  }

  async setLegalInfo(info: Partial<CompanyLegalInfo>): Promise<CompanyLegalInfo> {
    const current = await this.getLegalInfo();
    const updated = { ...current, ...info };
    const now = new Date().toISOString();
    await this.client
      .insert(cmsMetadataTable)
      .values({ key: "legal_info", valueJson: JSON.stringify(updated), updatedAt: now })
      .onConflictDoUpdate({
        target: cmsMetadataTable.key,
        set: { valueJson: JSON.stringify(updated), updatedAt: now },
      });
    return updated;
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    const rows = await this.client
      .select()
      .from(pendingChangesTable)
      .where(eq(pendingChangesTable.status, "PENDING"));
    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      targetId: r.targetId ?? undefined,
      payload: r.payload,
      status: r.status,
      createdAt: r.createdAt,
      appliedAt: r.appliedAt ?? undefined,
    }));
  }

  async enqueueChange(
    action: ChangeActionType,
    payload: unknown,
    targetId?: string
  ): Promise<PendingChange> {
    const change: PendingChange = {
      id: generateUuidV7(),
      action,
      targetId,
      payload,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    await this.client.insert(pendingChangesTable).values({
      ...change,
      targetId: targetId ?? null,
    });
    return change;
  }

  async markChangeApplied(id: string): Promise<void> {
    await this.client
      .update(pendingChangesTable)
      .set({ status: "APPLIED", appliedAt: new Date().toISOString() })
      .where(eq(pendingChangesTable.id, id));
  }

  async discardChange(id: string): Promise<boolean> {
    const res = await this.client
      .update(pendingChangesTable)
      .set({ status: "DISCARDED" })
      .where(eq(pendingChangesTable.id, id))
      .returning({ id: pendingChangesTable.id });
    return res.length > 0;
  }
}
