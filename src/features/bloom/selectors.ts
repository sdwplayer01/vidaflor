// src/features/bloom/selectors.ts
// Selector transversal: le de rotina + kids + casa + pets + saude + espiritual.
import { useRotinaStore }    from '@/features/rotina/store';
import { useKidsStore }      from '@/features/kids/store';
import { useCasaStore }      from '@/features/casa/store';
import { usePetsStore }      from '@/features/pets/store';
import { useSaudeStore }     from '@/features/saude/store';
import { useEspiritualStore } from '@/features/espiritual/store';
import { calcRotinaPct }     from '@/features/rotina/utils';
import { calcKidsPct }       from '@/features/kids/utils';
import { calcCasaPct }       from '@/features/casa/utils';
import { calcPetsPct }       from '@/features/pets/utils';
import { calcAguaPctPerfilAtivo } from '@/features/saude/utils';
import { calcEspiritualPct } from '@/features/espiritual/utils';
import { today }             from '@/shared/utils/date';
import { calcBloom, getBloomFase, type BloomFase } from './utils';
import type { BloomBreakdown } from './types';
import type { ISODate } from '@/shared/types/common';

export function useBloomDoDia(day?: ISODate): BloomBreakdown {
  const d = day ?? today();

  const rotinaPct    = useRotinaStore((s)  => calcRotinaPct(s, d));
  const kidsPct      = useKidsStore((s)    => calcKidsPct(s, d));
  const casaPct      = useCasaStore((s)    => calcCasaPct(s, d));
  const petsPct      = usePetsStore((s)    => calcPetsPct(s, d));
  const waterPct     = useSaudeStore((s)   => calcAguaPctPerfilAtivo(s, d));
  const espiritualPct= useEspiritualStore((s) => calcEspiritualPct(s, d));

  // Pesos: Minha Rotina 25% | Kids 10% | Casa 10% | Pets 5% | Agua 25% | Espiritual 25%
  const routinePct = Math.round(
    rotinaPct * 0.25 +
    kidsPct   * 0.10 +
    casaPct   * 0.10 +
    petsPct   * 0.05
  );

  return calcBloom({ routinePct, waterPct, espiritualPct });
}

export function useBloomFase(): BloomFase {
  const { total } = useBloomDoDia();
  return getBloomFase(total);
}
