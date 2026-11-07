import { eq, desc, and, or, like, SQL } from "drizzle-orm";
import type {
  ContactLead,
  CreateLeadDto,
  LeadFilter,
  LeadStatus,
} from "@khangviet/types";
import { ILeadRepository } from "../../interfaces/ILeadRepository";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { leadsTable, type LeadRecord } from "../schema/leads.schema";

function mapToLead(r: LeadRecord): ContactLead {
  return {
    id: r.id,
    fullName: r.fullName,
    phone: r.phone,
    email: r.email ?? undefined,
    serviceCategory: r.serviceCategory ?? undefined,
    projectScale: r.projectScale ?? undefined,
    message: r.message ?? undefined,
    status: r.status,
    notes: r.notes ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class D1LeadRepository implements ILeadRepository {
  constructor(private readonly client: D1Client) {}

  async createLead(data: CreateLeadDto): Promise<ContactLead> {
    const now = new Date().toISOString();
    const newRecord = {
      id: generateUuidV7(),
      fullName: data.fullName,
      phone: data.phone,
      email: data.email ?? null,
      serviceCategory: data.serviceCategory ?? null,
      projectScale: data.projectScale ?? null,
      message: data.message ?? null,
      status: "NEW" as const,
      notes: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.client.insert(leadsTable).values(newRecord);
    return mapToLead(newRecord);
  }

  async getLeads(filter?: LeadFilter): Promise<ContactLead[]> {
    const conditions: SQL[] = [];
    if (filter?.status) {
      conditions.push(eq(leadsTable.status, filter.status));
    }
    if (filter?.search) {
      const q = `%${filter.search}%`;
      conditions.push(
        or(
          like(leadsTable.fullName, q),
          like(leadsTable.phone, q),
          like(leadsTable.email, q)
        )!
      );
    }

    const query = this.client
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt));

    const records =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return records.map(mapToLead);
  }

  async getLeadById(id: string): Promise<ContactLead | null> {
    const records = await this.client
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id))
      .limit(1);

    return records[0] ? mapToLead(records[0]) : null;
  }

  async updateLeadStatus(
    id: string,
    status: LeadStatus,
    notes?: string
  ): Promise<ContactLead | null> {
    const now = new Date().toISOString();
    const updateValues: { status: LeadStatus; updatedAt: string; notes?: string } = {
      status,
      updatedAt: now,
    };
    if (notes !== undefined) {
      updateValues.notes = notes;
    }

    const updated = await this.client
      .update(leadsTable)
      .set(updateValues)
      .where(eq(leadsTable.id, id))
      .returning();

    return updated[0] ? mapToLead(updated[0]) : null;
  }

  async deleteLead(id: string): Promise<boolean> {
    const deleted = await this.client
      .delete(leadsTable)
      .where(eq(leadsTable.id, id))
      .returning({ id: leadsTable.id });

    return deleted.length > 0;
  }
}
