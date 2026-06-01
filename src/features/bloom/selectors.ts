import { useShallow } from 'zustand/react/shallow';
// src/features/bloom/selectors.ts — v2
// Transversal selectors: read from multiple stores, never import stores into stores.

import { useMemo }                from "react";
import { useRotinaStore }         from "@/features/rotina/store";
import { useSaudeStore }          from "@/features/saude/store";
import { useEspiritualStore }     from "@/features/espiritual/store";
import { calcRotinaPct }          from "@/features/rotina/utils";
import { calcAguaPctPerfilAtivo } from "@/features/saude/utils";
import { calcEspiritualPct }      from "@/features/espiritual/utils";
import { today }                  from "@/shared/utils/date";
import { calcBloom, getBloomFase, calcSpiritPct, calcSleepPct } from "./utils";
import type { BloomBreakdown, BloomFase } from "./types";
import type { ISODate } from "@/shared/types/common";

export function useBloomDoDia(day?: ISODate): BloomBreakdown {
  const d = day ?? today();

  const tasksPct  = useRotinaStore((s) => calcRotinaPct(s, d));
  const waterPct  = useSaudeStore((s)  => calcAguaPctPerfilAtivo(s, d));

  // sleep and steps: not yet in store schema → use neutral defaults
  const sleepHours = 7;
  const stepsPct   = 0;

  const moodPct = useSaudeStore((s) => {
    const p = s.profiles.find((pr) => pr.id === s.activeProfileId);
    return p?.moodLog?.[d] ? 80 : 0;
  });

  const spiritPct = useEspiritualStore((s) => calcEspiritualPct(s, d));
  const sleepPct  = calcSleepPct(sleepHours);

  return useMemo(
    () => calcBloom({ tasksPct, waterPct, stepsPct, sleepPct, moodPct, spiritPct }),
    [tasksPct, waterPct, stepsPct, sleepPct, moodPct, spiritPct]
  );
}

export function useBloomFase(): BloomFase {
  const { total } = useBloomDoDia();
  return getBloomFase(total);
}

export function useVitality(): number {
  return useBloomDoDia().total;
}

// ── Histórico dos últimos 7 dias ──────────────────────────────────────────────
export interface BloomHistoricoItem {
  date:  ISODate;
  label: string;   // 'Dom' | 'Seg' | ...
  total: number;
}

const DIA_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export function useBloomUltimos7Dias(): BloomHistoricoItem[] {
  const rotinaState    = useRotinaStore(useShallow((s) => ({
    tarefas:   s.tarefas,
    done:      s.done,
    essMode:   s.essMode,
    essential: s.essential,
  })));
  const saudeState     = useSaudeStore(useShallow((s) => ({
    profiles:        s.profiles,
    activeProfileId: s.activeProfileId,
  })));
  const espiritualState= useEspiritualStore(useShallow((s) => ({ gratidao: s.gratidao, leituras: s.leituras })));

  return useMemo(() => {
    const days: BloomHistoricoItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const d   = new Date(); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10) as ISODate;
      const dow = d.getDay();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tasksPct  = calcRotinaPct(rotinaState as any, iso);
      const waterPct  = calcAguaPctPerfilAtivo(saudeState, iso);
      const moodPct   = saudeState.profiles.find((pr) => pr.id === saudeState.activeProfileId)?.moodLog?.[iso] ? 80 : 0;
      const sleepPct  = calcSleepPct(7);
      const spiritPct = calcEspiritualPct({ gratidao: espiritualState.gratidao, leituras: espiritualState.leituras, oracoes: [], _version: 0, _hydrated: false }, iso);

      const { total } = calcBloom({ tasksPct, waterPct, stepsPct: 0, sleepPct, moodPct, spiritPct });
      days.push({ date: iso, label: DIA_SEMANA[dow] ?? '', total });
    }
    return days;
  }, [rotinaState, saudeState, espiritualState]);
}
