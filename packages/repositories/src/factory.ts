import {
  ICmsRepository,
  ILeadRepository,
  IUserRepository,
  ISessionRepository,
} from "./interfaces";
import { JsonCmsRepository } from "./json/JsonCmsRepository";
import { JsonLeadRepository } from "./json/JsonLeadRepository";
import { JsonUserRepository } from "./json/JsonUserRepository";
import { JsonSessionRepository } from "./json/JsonSessionRepository";
import {
  createD1Client,
  type D1DatabaseBinding,
  D1CmsRepository,
  D1LeadRepository,
  D1UserRepository,
} from "./d1";
import { D1SessionRepository } from "./d1/repositories/d1-session-repository";

export interface Repositories {
  cms: ICmsRepository;
  lead: ILeadRepository;
  user: IUserRepository;
  session?: ISessionRepository;
}

export type StorageDriver = "json" | "d1" | "sqlite";

let cachedJsonRepositories: Repositories | null = null;

/**
 * Factory cung cấp repository instances tương ứng với driver được chọn.
 * Khi driver là 'd1' và truyền binding, Drizzle ORM client sẽ được khởi tạo
 * để thực thi truy vấn type-safe trực tiếp trên Cloudflare D1.
 */
export function getRepositories(
  driver: StorageDriver = "json",
  d1Binding?: D1DatabaseBinding
): Repositories {
  if (driver === "d1" && d1Binding) {
    const client = createD1Client(d1Binding);
    return {
      cms: new D1CmsRepository(client),
      lead: new D1LeadRepository(client),
      user: new D1UserRepository(client),
      session: new D1SessionRepository(client),
    };
  }

  if (cachedJsonRepositories) {
    return cachedJsonRepositories;
  }

  cachedJsonRepositories = {
    cms: new JsonCmsRepository(),
    lead: new JsonLeadRepository(),
    user: new JsonUserRepository(),
    session: new JsonSessionRepository(),
  };

  return cachedJsonRepositories;
}
