// src/features/organiza/seed.ts
import type { OrganizaState } from "./types";
import { ORGANIZA_VERSION } from "./migrations";

export const seedOrganiza: OrganizaState = {
  shopping:  { items: [] },
  notes:     { list: [] },
  reminders: { list: [] },
  _version:  ORGANIZA_VERSION,
  _hydrated: false,
};
