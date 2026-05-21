// src/shared/utils/id.ts
import { ID } from "../types/common";

/**
 * Gera um ID único string.
 * Se crypto.randomUUID estiver disponível, usa ele.
 * Caso contrário, gera uma string pseudo-aleatória.
 */
export function genId(prefix?: string): ID {
  let uuid = "";
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    uuid = crypto.randomUUID();
  } else {
    // Fallback simples e rápido
    uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  return prefix ? `${prefix}_${uuid}` : uuid;
}
