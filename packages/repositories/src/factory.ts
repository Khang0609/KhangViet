import { ICmsRepository, ILeadRepository } from "./interfaces";
import { JsonCmsRepository } from "./json/JsonCmsRepository";
import { JsonLeadRepository } from "./json/JsonLeadRepository";

export interface Repositories {
  cms: ICmsRepository;
  lead: ILeadRepository;
}

export type StorageDriver = "json" | "d1" | "sqlite";

let cachedRepositories: Repositories | null = null;

export function getRepositories(driver: StorageDriver = "json"): Repositories {
  if (cachedRepositories) {
    return cachedRepositories;
  }

  // Future extension: if driver === 'd1' return new D1Repositories(env)
  cachedRepositories = {
    cms: new JsonCmsRepository(),
    lead: new JsonLeadRepository(),
  };

  return cachedRepositories;
}

