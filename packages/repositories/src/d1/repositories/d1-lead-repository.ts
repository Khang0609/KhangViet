import { eq, desc, and, or, like, SQL } from "drizzle-orm";
import type { ContactLead, CreateLeadDto, LeadFilter, LeadStatus } from "@khangviet/types";
import { ILeadRepository } from "../../interfaces/ILeadRepository";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { leadsTable } from "../schema/leads.schema";
import { identitiesTable } from "../schema/identities.schema";
import { mapToContactLead } from "./lead-mapper";

async function findOrCreateIdentity(client: D1Client, data: CreateLeadDto, now: string): Promise<string> {
  const phone = data.phone.trim();
  const existing = await client.select({ id: identitiesTable.id }).from(identitiesTable)
    .where(eq(identitiesTable.phone, phone)).limit(1);
  if (existing[0]?.id) return existing[0].id;
  const identityId = generateUuidV7();
  await client.insert(identitiesTable).values({
    id: identityId, fullName: data.fullName.trim(), phone,
    email: data.email?.trim() || null, identityType: "INDIVIDUAL", createdAt: now, updatedAt: now,
  });
  return identityId;
}

export class D1LeadRepository implements ILeadRepository {
  private readonly client: D1Client;
  constructor(client: D1Client) { this.client = client; }

  private selectQuery() {
    return this.client.select({
      id: leadsTable.id, identityId: leadsTable.identityId, serviceCategory: leadsTable.serviceCategory,
      projectScale: leadsTable.projectScale, initialMessage: leadsTable.initialMessage,
      status: leadsTable.status, createdAt: leadsTable.createdAt, updatedAt: leadsTable.updatedAt,
      fullName: identitiesTable.fullName, phone: identitiesTable.phone, email: identitiesTable.email, notes: identitiesTable.notes,
    }).from(leadsTable).innerJoin(identitiesTable, eq(leadsTable.identityId, identitiesTable.id));
  }

  async createLead(data: CreateLeadDto): Promise<ContactLead> {
    const now = new Date().toISOString();
    const identityId = await findOrCreateIdentity(this.client, data, now);
    const leadId = generateUuidV7();
    await this.client.insert(leadsTable).values({
      id: leadId, identityId, serviceCategory: data.serviceCategory ?? null,
      projectScale: data.projectScale ?? null, initialMessage: data.message ?? null,
      status: "NEW", createdAt: now, updatedAt: now,
    });
    return (await this.getLeadById(leadId))!;
  }

  async getLeads(filter?: LeadFilter): Promise<ContactLead[]> {
    const conditions: SQL[] = [];
    if (filter?.status) conditions.push(eq(leadsTable.status, filter.status));
    if (filter?.search) {
      const q = `%${filter.search.trim()}%`;
      conditions.push(or(like(identitiesTable.fullName, q), like(identitiesTable.phone, q), like(identitiesTable.email, q))!);
    }
    const query = this.selectQuery().orderBy(desc(leadsTable.createdAt));
    const records = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    return records.map(mapToContactLead);
  }

  async getLeadById(id: string): Promise<ContactLead | null> {
    const records = await this.selectQuery().where(eq(leadsTable.id, id)).limit(1);
    return records[0] ? mapToContactLead(records[0]) : null;
  }

  async updateLeadStatus(id: string, status: LeadStatus, notes?: string): Promise<ContactLead | null> {
    const now = new Date().toISOString();
    await this.client.update(leadsTable).set({ status, updatedAt: now }).where(eq(leadsTable.id, id));
    if (notes !== undefined) {
      const lead = await this.client.select({ identityId: leadsTable.identityId }).from(leadsTable).where(eq(leadsTable.id, id)).limit(1);
      if (lead[0]) await this.client.update(identitiesTable).set({ notes, updatedAt: now }).where(eq(identitiesTable.id, lead[0].identityId));
    }
    return this.getLeadById(id);
  }

  async deleteLead(id: string): Promise<boolean> {
    const deleted = await this.client.delete(leadsTable).where(eq(leadsTable.id, id)).returning({ id: leadsTable.id });
    return deleted.length > 0;
  }
}
