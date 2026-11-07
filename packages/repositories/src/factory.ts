import {
  ICmsRepository,
  ILeadRepository,
  IUserRepository,
} from "./interfaces";
import { JsonCmsRepository } from "./json/JsonCmsRepository";
import { JsonLeadRepository } from "./json/JsonLeadRepository";
import { JsonUserRepository } from "./json/JsonUserRepository";

export interface Repositories {
  cms: ICmsRepository;
  lead: ILeadRepository;
  user: IUserRepository;
}

export type StorageDriver = "json" | "d1" | "sqlite";

let cachedRepositories: Repositories | null = null;

export function getRepositories(driver: StorageDriver = "json"): Repositories {
  if (cachedRepositories) {
    return cachedRepositories;
  }

  cachedRepositories = {
    cms: new JsonCmsRepository(),
    lead: new JsonLeadRepository(),
    user: new JsonUserRepository(),
  };

  return cachedRepositories;
}
