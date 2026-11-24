import { desc, eq, and, or, like } from "drizzle-orm";
import type {
  CreateLeadActivityDto,
  CreateLeadDto,
  Lead,
  LeadActivity,
  LeadFilter,
  LeadStatus,
} from "@khangviet/types";
import type { ILeadRepository } from "../../interfaces/ILeadRepository";
import type { D1Client } from "../client";
import { leadActivitiesTable, leadsTable } from "../schema";
import { generateUuidV7 } from "../uuid-v7";
import {
  mapLeadActivityRecordToDomain,
  mapLeadRecordToDomain,
} from "./lead-mapper";

export class D1LeadRepository implements ILeadRepository {
  constructor(private readonly db: D1Client) {}

  async createLead(data: CreateLeadDto): Promise<Lead> {
    const now = Math.floor(Date.now() / 1000);
    const id = generateUuidV7();

    const record = {
      id,
      name: data.name.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      phone: data.phone.trim(),
      companyName: data.companyName?.trim() || null,
      serviceId: data.serviceId || null,
      message: data.message?.trim() || null,
      budgetRange: data.budgetRange?.trim() || null,
      source: data.source?.trim() || "website",
      status: "NEW" as LeadStatus,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(leadsTable).values(record);
    return mapLeadRecordToDomain(record);
  }

  async getLeads(filter?: LeadFilter): Promise<Lead[]> {
    const conditions = [];
    if (filter?.status) {
      conditions.push(eq(leadsTable.status, filter.status));
    }
    if (filter?.search?.trim()) {
      const term = `%${filter.search.trim()}%`;
      conditions.push(
        or(
          like(leadsTable.name, term),
          like(leadsTable.phone, term),
          like(leadsTable.email, term),
          like(leadsTable.companyName, term)
        )
      );
    }

    const rows =
      conditions.length > 0
        ? await this.db
            .select()
            .from(leadsTable)
            .where(and(...conditions))
            .orderBy(desc(leadsTable.createdAt))
        : await this.db
            .select()
            .from(leadsTable)
            .orderBy(desc(leadsTable.createdAt));

    return rows.map(mapLeadRecordToDomain);
  }

  async getLeadById(
    id: string
  ): Promise<(Lead & { activities: LeadActivity[] }) | null> {
    const rows = await this.db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id))
      .limit(1);

    if (!rows[0]) return null;

    const activities = await this.db
      .select()
      .from(leadActivitiesTable)
      .where(eq(leadActivitiesTable.leadId, id))
      .orderBy(desc(leadActivitiesTable.createdAt));

    return {
      ...mapLeadRecordToDomain(rows[0]),
      activities: activities.map(mapLeadActivityRecordToDomain),
    };
  }

  async updateLeadStatus(
    id: string,
    status: LeadStatus,
    note?: string,
    userId?: string
  ): Promise<Lead | null> {
    const existing = await this.db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id))
      .limit(1);

    if (!existing[0]) return null;

    const now = Math.floor(Date.now() / 1000);
    await this.db
      .update(leadsTable)
      .set({ status, updatedAt: now })
      .where(eq(leadsTable.id, id));

    await this.db.insert(leadActivitiesTable).values({
      id: generateUuidV7(),
      leadId: id,
      userId: userId ?? null,
      action: "STATUS_CHANGE",
      note: note?.trim() || `Chuyển trạng thái sang ${status}`,
      createdAt: now,
    });

    const updated = await this.db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id))
      .limit(1);

    return updated[0] ? mapLeadRecordToDomain(updated[0]) : null;
  }

  async addLeadActivity(
    leadId: string,
    data: CreateLeadActivityDto,
    userId?: string
  ): Promise<LeadActivity | null> {
    const existing = await this.db
      .select({ id: leadsTable.id })
      .from(leadsTable)
      .where(eq(leadsTable.id, leadId))
      .limit(1);

    if (!existing[0]) return null;

    const now = Math.floor(Date.now() / 1000);
    const record = {
      id: generateUuidV7(),
      leadId,
      userId: userId ?? null,
      action: data.action,
      note: data.note.trim(),
      createdAt: now,
    };

    await this.db.insert(leadActivitiesTable).values(record);
    return mapLeadActivityRecordToDomain(record);
  }

  async deleteLead(id: string): Promise<boolean> {
    const existing = await this.db
      .select({ id: leadsTable.id })
      .from(leadsTable)
      .where(eq(leadsTable.id, id))
      .limit(1);

    if (!existing[0]) return false;

    await this.db.delete(leadsTable).where(eq(leadsTable.id, id));
    return true;
  }
}
