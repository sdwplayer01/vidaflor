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

  const sleepHours = useSaudeStore((s) => {
    const p = s.profiles.find((pr) => pr.id === s.activeProfileId);
    return (p?.notes as any)?.[d]?.sleep ?? 7;
  });

  const stepsPct = useSaudeStore((s) => {
    const p    = s.profiles.find((pr) => pr.id === s.activeProfileId);
    const goal = (p as any)?.stepsGoal ?? 8000;
    const val  = (p?.notes as any)?.[d]?.steps ?? 0;
    return goal > 0 ? Math.min(100, (val / goal) * 100) : 0;
  });

  const moodPct = useSaudeStore((s) => {
    const p = s.profiles.find((pr) => pr.id === s.activeProfileId);
    return (p?.notes as any)?.[d]?.mood ? 80 : 0;
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
