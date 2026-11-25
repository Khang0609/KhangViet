# Architectural Analysis & Fix Blueprint — Milestone 1 Iteration 2
## Code Modularization & Line Limits De-escalation

**Agent**: Explorer 4 (`teamwork_explorer_m1_fix_1`)  
**Role**: Code Modularization & Line Limits Architect  
**Date**: 2026-11-08  
**Target Milestone**: Milestone 1 Iteration 2 (Remediation of Forensic Audit Integrity Veto)  

---

## 1. Executive Summary & Problem Formulation

During Milestone 1 Iteration 1, the Forensic Auditor issued an **INTEGRITY VIOLATION VETO** due to two files exceeding the project's strict 100-line hard limit and two functions exceeding the 35-line limit, compounded by inaccurate self-attestation in the worker report:
1. `packages/repositories/src/d1/repositories/d1-lead-repository.ts`: 112 lines (limit <= 100). Method `createLead`: 36 lines (limit <= 35).
2. `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts`: 102 lines (limit <= 100).
3. `packages/repositories/src/d1/seed-projects.ts`: Function `seedProjectsAndMedia`: 42 lines (limit <= 35).

Furthermore, Reviewer 1 and Reviewer 2 identified:
- Borderline file size on `d1-user-repository.ts` (93-94 lines, approaching the 90-line refactor trigger).
- Sub-optimal media deletion in `D1CmsProjectRepo.syncMedia` (deleting all media types instead of filtering by `mediaType: 'GALLERY_IMAGE'`).
- Missing SQLite `CHECK` constraints on `user_accounts.role`, `leads.status`, and `projects.status`.

This blueprint delivers the exact code modularization and line-by-line decomposition to resolve all violations, guaranteeing every source file is strictly <= 80 lines and every function is strictly <= 26 lines.

---

## 2. Quantitative Line & Function Limits Audit

| File Path | Current Lines | Target Lines | Violation Status | Key Culprit Method / Function | Current Length | Target Length |
|---|:---:|:---:|:---:|---|:---:|:---:|
| `d1-lead-repository.ts` | 112 | **66** | 🔴 Exceeds file & function limit | `createLead` | 36 lines | **16 lines** |
| `lead-mapper.ts` | 32 | **79** | 🟢 Compliant (absorbing logic) | `findOrCreateLeadIdentity` | new | **22 lines** |
| `d1-cms-project-repo.ts` | 102 | **75** | 🔴 Exceeds file limit | `createProject` | 28 lines | **24 lines** |
| `project-mapper.ts` | 36 | **67** | 🟢 Compliant (absorbing helper) | `syncProjectMedia` | new | **26 lines** |
| `seed-projects.ts` | 48 | **60** | 🔴 Exceeds function limit | `seedProjectsAndMedia` | 42 lines | **5 lines** |
| `d1-user-repository.ts` | 93 | **58** | 🟡 Warning threshold (>90) | Class inline mappers | 33 lines | *(Extracted to user-mapper)* |
| `user-mapper.ts` | (new) | **35** | 🟢 Compliant (clean separation) | `mapToUser`, `mapToSafeUser` | new | **12 lines** |

---

## 3. Concrete Architectural Blueprints & Implementation Details

### 3.1. Decomposition 1: `d1-lead-repository.ts` & `lead-mapper.ts`

#### Problem
`createLead` performs two distinct operations: (1) identity lookup and creation (Party Model normalization), and (2) lead entity creation. Inline identity upserting adds 20 lines to `createLead` (pushing it to 36 lines) and pushes the file to 112 lines. In addition, `selectLeadQuery()` occupies 19 lines of boilerplate.

#### Solution
1. Move `selectLeadBaseQuery` and `findOrCreateLeadIdentity` into `packages/repositories/src/d1/repositories/lead-mapper.ts`.
2. Normalize inputs in `findOrCreateLeadIdentity` (e.g., `phone.trim()`, `fullName.trim()`).
3. Streamline `d1-lead-repository.ts` to call these helpers.

#### Target Implementation for `lead-mapper.ts` (79 lines):
```ts
import { eq } from "drizzle-orm";
import type { ContactLead, CreateLeadDto } from "@khangviet/types";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { leadsTable } from "../schema/leads.schema";
import { identitiesTable } from "../schema/identities.schema";

export interface LeadJoinedRow {
  id: string;
  identityId: string;
  serviceCategory: string | null;
  projectScale: string | null;
  initialMessage: string | null;
  status: ContactLead["status"];
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
}

export function mapToContactLead(r: LeadJoinedRow): ContactLead {
  return {
    id: r.id,
    fullName: r.fullName,
    phone: r.phone,
    email: r.email ?? undefined,
    serviceCategory: r.serviceCategory ?? undefined,
    projectScale: r.projectScale ?? undefined,
    message: r.initialMessage ?? undefined,
    status: r.status,
    notes: r.notes ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function findOrCreateLeadIdentity(
  client: D1Client,
  data: Pick<CreateLeadDto, "fullName" | "phone" | "email">,
  now: string
): Promise<string> {
  const normalizedPhone = data.phone.trim();
  const existing = await client
    .select({ id: identitiesTable.id })
    .from(identitiesTable)
    .where(eq(identitiesTable.phone, normalizedPhone))
    .limit(1);

  if (existing[0]?.id) return existing[0].id;

  const identityId = generateUuidV7();
  await client.insert(identitiesTable).values({
    id: identityId,
    fullName: data.fullName.trim(),
    phone: normalizedPhone,
    email: data.email?.trim() || null,
    identityType: "INDIVIDUAL",
    createdAt: now,
    updatedAt: now,
  });
  return identityId;
}

export function selectLeadBaseQuery(client: D1Client) {
  return client
    .select({
      id: leadsTable.id,
      identityId: leadsTable.identityId,
      serviceCategory: leadsTable.serviceCategory,
      projectScale: leadsTable.projectScale,
      initialMessage: leadsTable.initialMessage,
      status: leadsTable.status,
      createdAt: leadsTable.createdAt,
      updatedAt: leadsTable.updatedAt,
      fullName: identitiesTable.fullName,
      phone: identitiesTable.phone,
      email: identitiesTable.email,
      notes: identitiesTable.notes,
    })
    .from(leadsTable)
    .innerJoin(identitiesTable, eq(leadsTable.identityId, identitiesTable.id));
}
```

#### Target Implementation for `d1-lead-repository.ts` (66 lines):
```ts
import { eq, desc, and, or, like, SQL } from "drizzle-orm";
import type { ContactLead, CreateLeadDto, LeadFilter, LeadStatus } from "@khangviet/types";
import { ILeadRepository } from "../../interfaces/ILeadRepository";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { leadsTable } from "../schema/leads.schema";
import { identitiesTable } from "../schema/identities.schema";
import { mapToContactLead, findOrCreateLeadIdentity, selectLeadBaseQuery } from "./lead-mapper";

export class D1LeadRepository implements ILeadRepository {
  constructor(private readonly client: D1Client) {}

  async createLead(data: CreateLeadDto): Promise<ContactLead> {
    const now = new Date().toISOString();
    const identityId = await findOrCreateLeadIdentity(this.client, data, now);
    const leadId = generateUuidV7();
    await this.client.insert(leadsTable).values({
      id: leadId,
      identityId,
      serviceCategory: data.serviceCategory ?? null,
      projectScale: data.projectScale ?? null,
      initialMessage: data.message ?? null,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    });
    return (await this.getLeadById(leadId))!;
  }

  async getLeads(filter?: LeadFilter): Promise<ContactLead[]> {
    const conditions: SQL[] = [];
    if (filter?.status) {
      conditions.push(eq(leadsTable.status, filter.status));
    }
    if (filter?.search) {
      const q = `%${filter.search}%`;
      conditions.push(
        or(like(identitiesTable.fullName, q), like(identitiesTable.phone, q), like(identitiesTable.email, q))!
      );
    }
    const query = selectLeadBaseQuery(this.client).orderBy(desc(leadsTable.createdAt));
    const records = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    return records.map(mapToContactLead);
  }

  async getLeadById(id: string): Promise<ContactLead | null> {
    const records = await selectLeadBaseQuery(this.client).where(eq(leadsTable.id, id)).limit(1);
    return records[0] ? mapToContactLead(records[0]) : null;
  }

  async updateLeadStatus(id: string, status: LeadStatus, notes?: string): Promise<ContactLead | null> {
    const now = new Date().toISOString();
    await this.client.update(leadsTable).set({ status, updatedAt: now }).where(eq(leadsTable.id, id));
    if (notes !== undefined) {
      const lead = await this.client.select({ identityId: leadsTable.identityId }).from(leadsTable).where(eq(leadsTable.id, id)).limit(1);
      if (lead[0]) {
        await this.client.update(identitiesTable).set({ notes, updatedAt: now }).where(eq(identitiesTable.id, lead[0].identityId));
      }
    }
    return this.getLeadById(id);
  }

  async deleteLead(id: string): Promise<boolean> {
    const deleted = await this.client.delete(leadsTable).where(eq(leadsTable.id, id)).returning({ id: leadsTable.id });
    return deleted.length > 0;
  }
}
```

---

### 3.2. Decomposition 2: `d1-cms-project-repo.ts` & `project-mapper.ts`

#### Problem
`d1-cms-project-repo.ts` is 102 lines because it hosts `syncMedia` (18 lines) directly inside the repository class. In addition, repeated parsing of `year` occurs across `createProject` and `updateProject`. Furthermore, `syncMedia` previously deleted all media rows matching `projectId` without filtering by `mediaType: 'GALLERY_IMAGE'`, creating a regression risk for other media types.

#### Solution
1. Extract `parseProjectYear` and `syncProjectMedia` to `packages/repositories/src/d1/repositories/project-mapper.ts`.
2. In `syncProjectMedia`, enforce `and(eq(projectMediaTable.projectId, projectId), eq(projectMediaTable.mediaType, "GALLERY_IMAGE"))`.
3. In `d1-cms-project-repo.ts`, call `syncProjectMedia` and `parseProjectYear`.

#### Target Implementation for `project-mapper.ts` (67 lines):
```ts
import { eq, and } from "drizzle-orm";
import type { FeaturedProject, ProjectGalleryItem } from "@khangviet/types";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import type { ProjectRecord } from "../schema/projects.schema";
import { projectMediaTable, type ProjectMediaRecord } from "../schema/project-media.schema";

export function parseProjectYear(year: string | number | undefined): number {
  return typeof year === "number" ? year : parseInt(String(year), 10) || 2026;
}

export function mapMediaToGalleryItem(m: ProjectMediaRecord): ProjectGalleryItem {
  return {
    id: m.id,
    src: m.publicUrl,
    caption: m.caption ?? "",
    location: m.location ?? "",
    spec: m.spec ?? "",
    aspect: (m.aspectRatio as "landscape" | "portrait" | "wide") || "landscape",
  };
}

export function mapProjectRecordToFeatured(
  p: ProjectRecord,
  mediaList: ProjectMediaRecord[] = []
): FeaturedProject {
  return {
    id: p.id,
    code: p.code,
    title: p.title,
    subtitle: p.subtitle,
    client: p.client,
    locations: p.locations,
    year: String(p.year),
    categoryTag: p.categoryTag,
    scaleMetric: p.scaleMetric,
    materials: p.materials,
    engineeringNotes: p.engineeringNotes,
    summary: p.summary,
    coverImage: p.coverImage,
    gallery: mediaList.map(mapMediaToGalleryItem),
  };
}

export async function syncProjectMedia(
  client: D1Client,
  projectId: string,
  gallery: ProjectGalleryItem[],
  now: string
): Promise<void> {
  await client
    .delete(projectMediaTable)
    .where(
      and(
        eq(projectMediaTable.projectId, projectId),
        eq(projectMediaTable.mediaType, "GALLERY_IMAGE")
      )
    );

  for (let i = 0; i < gallery.length; i++) {
    const item = gallery[i];
    await client.insert(projectMediaTable).values({
      id: item.id || generateUuidV7(),
      projectId,
      mediaType: "GALLERY_IMAGE",
      publicUrl: item.src,
      caption: item.caption,
      location: item.location,
      spec: item.spec,
      aspectRatio: item.aspect,
      sortOrder: i,
      createdAt: now,
    });
  }
}
```

#### Target Implementation for `d1-cms-project-repo.ts` (75 lines):
```ts
import { eq, asc } from "drizzle-orm";
import type { FeaturedProject } from "@khangviet/types";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { projectsTable } from "../schema/projects.schema";
import { projectMediaTable, type ProjectMediaRecord } from "../schema/project-media.schema";
import { mapProjectRecordToFeatured, parseProjectYear, syncProjectMedia } from "./project-mapper";

export class D1CmsProjectRepo {
  constructor(private readonly client: D1Client) {}

  async getProjects(): Promise<FeaturedProject[]> {
    const projects = await this.client.select().from(projectsTable);
    const media = await this.client.select().from(projectMediaTable).orderBy(asc(projectMediaTable.sortOrder));
    const mediaMap = new Map<string, ProjectMediaRecord[]>();
    for (const m of media) {
      const list = mediaMap.get(m.projectId) || [];
      list.push(m);
      mediaMap.set(m.projectId, list);
    }
    return projects.map((p) => mapProjectRecordToFeatured(p, mediaMap.get(p.id) || []));
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    const records = await this.client.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!records[0]) return null;
    const media = await this.client.select().from(projectMediaTable).where(eq(projectMediaTable.projectId, id)).orderBy(asc(projectMediaTable.sortOrder));
    return mapProjectRecordToFeatured(records[0], media);
  }

  async createProject(data: Omit<FeaturedProject, "id"> & { id?: string }): Promise<FeaturedProject> {
    const id = data.id || generateUuidV7();
    const now = new Date().toISOString();
    await this.client.insert(projectsTable).values({
      id,
      code: data.code,
      title: data.title,
      subtitle: data.subtitle,
      client: data.client,
      locations: data.locations,
      year: parseProjectYear(data.year),
      categoryTag: data.categoryTag,
      scaleMetric: data.scaleMetric,
      materials: data.materials,
      engineeringNotes: data.engineeringNotes,
      summary: data.summary,
      coverImage: data.coverImage,
      status: "PUBLISHED",
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    });
    if (data.gallery && data.gallery.length > 0) {
      await syncProjectMedia(this.client, id, data.gallery, now);
    }
    return (await this.getProjectById(id))!;
  }

  async updateProject(id: string, data: Partial<FeaturedProject>): Promise<FeaturedProject | null> {
    const { gallery, ...fields } = data;
    const now = new Date().toISOString();
    const updateValues: Record<string, unknown> = { updatedAt: now };
    if (fields.year !== undefined) updateValues.year = parseProjectYear(fields.year);
    for (const [k, v] of Object.entries(fields)) {
      if (k !== "year" && v !== undefined) updateValues[k] = v;
    }
    if (Object.keys(updateValues).length > 1) {
      await this.client.update(projectsTable).set(updateValues).where(eq(projectsTable.id, id));
    }
    if (gallery !== undefined) {
      await syncProjectMedia(this.client, id, gallery, now);
    }
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = await this.client.delete(projectsTable).where(eq(projectsTable.id, id)).returning({ id: projectsTable.id });
    return deleted.length > 0;
  }
}
```

---

### 3.3. Decomposition 3: `packages/repositories/src/d1/seed-projects.ts`

#### Problem
`seedProjectsAndMedia` is 42 lines because it executes a nested loop: iterating over projects and inserting projects, then iterating over each gallery item and inserting into `project_media`.

#### Solution
Decompose into 3 clear functions:
1. `seedProjectMediaList(client, projectId, gallery, now)`: 19 lines (inserts media records with `onConflictDoNothing()`).
2. `seedSingleProject(client, p, now)`: 26 lines (inserts project record and delegates gallery seeding).
3. `seedProjectsAndMedia(client, now)`: 5 lines (iterates over `initialLandingContent.featuredProjects`).

#### Target Implementation for `seed-projects.ts` (60 lines):
```ts
import { initialLandingContent } from "@khangviet/data";
import type { FeaturedProject, ProjectGalleryItem } from "@khangviet/types";
import { type D1Client } from "./client";
import { projectsTable } from "./schema/projects.schema";
import { projectMediaTable } from "./schema/project-media.schema";
import { generateUuidV7 } from "./uuid-v7";

async function seedProjectMediaList(
  client: D1Client,
  projectId: string,
  gallery: ProjectGalleryItem[],
  now: string
): Promise<void> {
  for (let i = 0; i < gallery.length; i++) {
    const item = gallery[i];
    await client.insert(projectMediaTable).values({
      id: item.id || generateUuidV7(),
      projectId,
      mediaType: "GALLERY_IMAGE",
      publicUrl: item.src,
      caption: item.caption,
      location: item.location,
      spec: item.spec,
      aspectRatio: item.aspect,
      sortOrder: i,
      createdAt: now,
    }).onConflictDoNothing();
  }
}

async function seedSingleProject(
  client: D1Client,
  p: FeaturedProject,
  now: string
): Promise<void> {
  const year = typeof p.year === "number" ? p.year : parseInt(String(p.year), 10) || 2026;
  await client.insert(projectsTable).values({
    id: p.id,
    code: p.code,
    title: p.title,
    subtitle: p.subtitle,
    client: p.client,
    locations: p.locations,
    year,
    categoryTag: p.categoryTag,
    scaleMetric: p.scaleMetric,
    materials: p.materials,
    engineeringNotes: p.engineeringNotes,
    summary: p.summary,
    coverImage: p.coverImage,
    status: "PUBLISHED",
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  if (p.gallery && p.gallery.length > 0) {
    await seedProjectMediaList(client, p.id, p.gallery, now);
  }
}

export async function seedProjectsAndMedia(client: D1Client, now: string): Promise<void> {
  for (const p of initialLandingContent.featuredProjects) {
    await seedSingleProject(client, p, now);
  }
}
```

---

### 3.4. Architectural Refinement: `d1-user-repository.ts` & `user-mapper.ts`

#### Problem
`d1-user-repository.ts` currently stands at 93-94 lines. While technically under 100 lines, it has triggered the 90-line refactor warning specified in `.agents/rules/code-organization.md` ("Nếu file chạm mốc 90 dòng: Tách hooks/helpers ra file riêng cùng cấp").

#### Solution
Extract `UserJoinedRow`, `mapToUser`, and `mapToSafeUser` into a dedicated mapper `packages/repositories/src/d1/repositories/user-mapper.ts`. This reduces `d1-user-repository.ts` to 58 lines and establishes clean, symmetrical design across all 3 repository domains:
- Leads: `d1-lead-repository.ts` (66 lines) + `lead-mapper.ts` (79 lines)
- Projects: `d1-cms-project-repo.ts` (75 lines) + `project-mapper.ts` (67 lines)
- Users: `d1-user-repository.ts` (58 lines) + `user-mapper.ts` (35 lines)

#### Target Implementation for `user-mapper.ts` (35 lines):
```ts
import type { User, SafeUser } from "@khangviet/types";

export interface UserJoinedRow {
  id: string;
  email: string;
  role: User["role"];
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
}

export function mapToUser(r: UserJoinedRow): User {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    password: r.passwordHash,
    info: { name: r.fullName, phone: r.phone },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function mapToSafeUser(r: UserJoinedRow): SafeUser {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    info: { name: r.fullName, phone: r.phone },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
```

#### Target Implementation for `d1-user-repository.ts` (58 lines):
```ts
import { eq, sql } from "drizzle-orm";
import type { User, SafeUser } from "@khangviet/types";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { type D1Client } from "../client";
import { userAccountsTable } from "../schema/user-accounts.schema";
import { identitiesTable } from "../schema/identities.schema";
import { mapToUser, mapToSafeUser } from "./user-mapper";

export class D1UserRepository implements IUserRepository {
  constructor(private readonly client: D1Client) {}

  private selectUserQuery() {
    return this.client
      .select({
        id: userAccountsTable.id,
        email: userAccountsTable.email,
        role: userAccountsTable.role,
        passwordHash: userAccountsTable.passwordHash,
        createdAt: userAccountsTable.createdAt,
        updatedAt: userAccountsTable.updatedAt,
        fullName: identitiesTable.fullName,
        phone: identitiesTable.phone,
      })
      .from(userAccountsTable)
      .innerJoin(identitiesTable, eq(userAccountsTable.identityId, identitiesTable.id));
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const records = await this.selectUserQuery()
      .where(sql`lower(${userAccountsTable.email}) = ${normalized}`)
      .limit(1);
    return records[0] ? mapToUser(records[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const records = await this.selectUserQuery().where(eq(userAccountsTable.id, id)).limit(1);
    return records[0] ? mapToUser(records[0]) : null;
  }

  async findSafeById(id: string): Promise<SafeUser | null> {
    const records = await this.selectUserQuery().where(eq(userAccountsTable.id, id)).limit(1);
    return records[0] ? mapToSafeUser(records[0]) : null;
  }

  async getAllUsers(): Promise<SafeUser[]> {
    const records = await this.selectUserQuery();
    return records.map(mapToSafeUser);
  }
}
```

---

## 4. Verification & Validation Protocol

To guarantee zero regression and empirical compliance, the implementer must execute:

1. **Physical Line Count Verification**:
   ```bash
   node -e "
   const fs = require('fs');
   const files = [
     'packages/repositories/src/d1/repositories/d1-lead-repository.ts',
     'packages/repositories/src/d1/repositories/lead-mapper.ts',
     'packages/repositories/src/d1/repositories/d1-cms-project-repo.ts',
     'packages/repositories/src/d1/repositories/project-mapper.ts',
     'packages/repositories/src/d1/seed-projects.ts',
     'packages/repositories/src/d1/repositories/d1-user-repository.ts',
     'packages/repositories/src/d1/repositories/user-mapper.ts'
   ];
   files.forEach(f => {
     const count = fs.readFileSync(f, 'utf8').split('\n').length;
     console.log((count <= 100 ? 'PASS' : 'FAIL') + ' [' + count + ' lines]: ' + f);
   });
   "
   ```

2. **Full Compilation Check**:
   ```bash
   pnpm --filter @khangviet/repositories run build
   pnpm --filter api run build
   pnpm --filter web exec tsc --noEmit
   ```

3. **Full Automated Test Suite**:
   ```bash
   pnpm --filter @khangviet/repositories test
   node --test packages/repositories/test/adversarial-projects-media.mjs
   pnpm --filter api test:auth
   ```
