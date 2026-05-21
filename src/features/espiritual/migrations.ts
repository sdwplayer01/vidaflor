// src/features/espiritual/migrations.ts

export const ESPIRITUAL_VERSION = 1;

/**
 * Migra o estado persistido de uma versão antiga para a atual.
 * fromVersion é a versão que estava salva no storage.
 */
export function migrate(state: any, fromVersion: number): any {
  let s = state;

  // v0 → v1: schema inicial com IDs string (genId) e campos tipados.
  // Dados do legado (gratitude: Record<string, string[]>) são convertidos
  // para Record<ISODate, GratidaoEntry[]> com IDs gerados.
  if (fromVersion < 1) {
    // Converte gratitude legada (string[]) → GratidaoEntry[]
    const legacyGratitude: Record<string, string[]> = s?.gratitude ?? {};
    const newGratidao: Record<string, { id: string; text: string; createdAt: string }[]> = {};
    for (const [day, texts] of Object.entries(legacyGratitude)) {
      if (Array.isArray(texts)) {
        newGratidao[day] = texts.map((text, idx) => ({
          id: `grat_legacy_${day}_${idx}`,
          text: String(text),
          createdAt: `${day}T12:00:00.000Z`,
        }));
      }
    }

    // Converte prayers legadas (id: number) → Oracao[] (id: string)
    const legacyPrayers: Array<{
      id: number; person: string; request: string; answered: boolean;
    }> = s?.prayers ?? [];
    const newOracoes = legacyPrayers.map((p) => ({
      id: `orac_legacy_${p.id}`,
      pessoa: p.person ?? '',
      pedido: p.request ?? '',
      respondida: Boolean(p.answered),
      createdAt: new Date(p.id).toISOString(),
    }));

    // Converte readings legadas (id: number) → Leitura[] (id: string)
    const legacyReadings: Array<{
      id: number; book: string; chapter: string; date: string;
    }> = s?.readings ?? [];
    const newLeituras = legacyReadings.map((r) => ({
      id: `leit_legacy_${r.id}`,
      livro: r.book ?? '',
      capitulo: parseInt(String(r.chapter ?? '0'), 10) || 0,
      data: r.date ?? '',
      createdAt: new Date(r.id).toISOString(),
    }));

    s = {
      ...s,
      gratidao: Object.keys(newGratidao).length > 0 ? newGratidao : (s.gratidao ?? {}),
      oracoes: newOracoes.length > 0 ? newOracoes : (s.oracoes ?? []),
      leituras: newLeituras.length > 0 ? newLeituras : (s.leituras ?? []),
    };

    // Remove campos do schema legado
    delete s.gratitude;
    delete s.prayers;
    delete s.readings;
  }

  return s;
}
