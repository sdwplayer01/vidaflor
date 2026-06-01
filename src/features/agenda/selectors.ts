// src/features/agenda/selectors.ts
import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useRotinaStore } from '@/features/rotina/store';
import { useCasaStore }   from '@/features/casa/store';
import { useKidsStore }   from '@/features/kids/store';
import { usePetsStore }   from '@/features/pets/store';
import { useOrganizaStore } from '@/features/organiza/store';
import { useAgendaStore }   from './store';
import { tarefaAtivaNoDia } from '@/features/casa/utils';
import type { ISODate } from '@/shared/types/common';
import type { DiaItem, DiaSource, Turno } from './types';

// ── helpers ───────────────────────────────────────────────────────────────────
function turnoFromTime(time?: string): Turno {
  if (!time) return 'manha';
  const h = parseInt(time.slice(0, 2), 10);
  if (h >= 18) return 'noite';
  if (h >= 12) return 'tarde';
  return 'manha';
}

function makeId(source: DiaSource, nativeId: string): string {
  return `${source}:${nativeId}`;
}

// ── useDia ────────────────────────────────────────────────────────────────────
export function useDia(date: ISODate): DiaItem[] {
  const rotina  = useRotinaStore(useShallow((s) => ({
    manha: s.tarefas.manha, tarde: s.tarefas.tarde, noite: s.tarefas.noite,
    done:  s.done[date] ?? [],
  })));

  const casa    = useCasaStore(useShallow((s) => ({
    tarefas: s.tarefas,
    done:    s.done[date] ?? [],
  })));

  const kids    = useKidsStore(useShallow((s) => ({
    criancas: s.criancas,
    done:     s.done[date] ?? [],
  })));

  const pets    = usePetsStore(useShallow((s) => ({
    pets: s.pets,
    done: s.done[date] ?? {},
  })));

  const reminders = useOrganizaStore(
    useShallow((s) => s.reminders.list.filter((r) => r.date === date))
  );

  const agenda  = useAgendaStore(useShallow((s) => {
    // Tarefas que ocorrem nesta data (avulsas ou recorrentes que casam)
    const doneIds = s.done[date] ?? [];
    return s.tarefas
      .filter((t) => {
        if (!t.recorrencia) return t.date === date;
        // recorrente: usa a mesma lógica que casa/utils com tipo compatível
        const rec = t.recorrencia;
        const d   = new Date(date + 'T00:00:00');
        if (rec.tipo === 'diaria')  return true;
        if (rec.tipo === 'semanal') return rec.diasSemana.includes(d.getDay());
        if (rec.tipo === 'mensal')  return rec.diaMes === d.getDate();
        if (rec.tipo === 'avulsa')  return t.date === date;
        return false;
      })
      .map((t) => ({ ...t, doneHoje: doneIds.includes(t.id) }));
  }));

  return useMemo((): DiaItem[] => {
    const items: DiaItem[] = [];

    // ── rotina ───────────────────────────────────────────────────────────────
    for (const turno of ['manha', 'tarde', 'noite'] as Turno[]) {
      for (const t of rotina[turno]) {
        items.push({
          id:       makeId('rotina', t.id),
          nativeId: t.id,
          source:   'rotina',
          turno,
          title:    t.task,
          time:     t.time,
          done:     rotina.done.includes(t.id),
        });
      }
    }

    // ── casa ─────────────────────────────────────────────────────────────────
    for (const t of casa.tarefas) {
      if (!tarefaAtivaNoDia(t, date)) continue;
      items.push({
        id:       makeId('casa', t.id),
        nativeId: t.id,
        source:   'casa',
        turno:    'manha',
        title:    t.task,
        tag:      t.ambiente,
        done:     casa.done.includes(t.id),
      });
    }

    // ── crianças ─────────────────────────────────────────────────────────────
    for (const crianca of kids.criancas) {
      for (const kt of crianca.tasks) {
        items.push({
          id:       makeId('crianca', kt.id),
          nativeId: kt.id,
          source:   'crianca',
          turno:    turnoFromTime(kt.time),
          title:    `${crianca.avatar} ${kt.task}`,
          time:     kt.time,
          tag:      crianca.name,
          assignee: crianca.id,
          done:     kids.done.includes(kt.id),
        });
      }
    }

    // ── pets ─────────────────────────────────────────────────────────────────
    for (const pet of pets.pets) {
      for (const c of pet.cuidados) {
        items.push({
          id:       makeId('pet', c.id),
          nativeId: c.id,
          source:   'pet',
          turno:    turnoFromTime(c.horario),
          title:    c.descricao,
          time:     c.horario,
          tag:      `${pet.avatar} ${pet.name}`,
          done:     (pets.done[c.id] ?? 0) > 0,
        });
      }
    }

    // ── compromissos (reminders datados) ─────────────────────────────────────
    for (const r of reminders) {
      items.push({
        id:       makeId('compromisso', r.id),
        nativeId: r.id,
        source:   'compromisso',
        turno:    turnoFromTime(r.time),
        title:    r.title,
        time:     r.time,
        tag:      r.category,
        done:     r.done,
      });
    }

    // ── tarefas avulsas/agenda ────────────────────────────────────────────────
    for (const t of agenda) {
      items.push({
        id:       makeId('tarefa', t.id),
        nativeId: t.id,
        source:   'tarefa',
        turno:    t.turno,
        title:    t.title,
        time:     t.time,
        assignee: t.assignee !== 'voce' ? t.assignee : undefined,
        done:     t.doneHoje,
      });
    }

    // Ordenar: por turno (manha→tarde→noite), depois por time dentro do turno
    const turnoOrder: Record<Turno, number> = { manha: 0, tarde: 1, noite: 2 };
    return items.sort((a, b) => {
      const to = turnoOrder[a.turno] - turnoOrder[b.turno];
      if (to !== 0) return to;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, rotina, casa, kids, pets, reminders, agenda]);
}

// useDiaPct — percentual de itens concluídos no dia
export function useDiaPct(date: ISODate): { feitos: number; total: number; pct: number } {
  const items = useDia(date);
  const total = items.length;
  const feitos = items.filter((i) => i.done).length;
  const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;
  return { feitos, total, pct };
}

// useDiaActions — toggle handler cross-feature para DiaScreen
export function useDiaActions(date: ISODate): (item: DiaItem) => void {
  const toggleRotina   = useRotinaStore((s) => s.toggleTarefa);
  const toggleCasa     = useCasaStore((s) => s.toggleTarefaCasa);
  const toggleKid      = useKidsStore((s) => s.toggleTarefaKid);
  const registrarPet   = usePetsStore((s) => s.registrarFeito);
  const desfazerPet    = usePetsStore((s) => s.desfazerFeito);
  const toggleReminder = useOrganizaStore((s) => s.marcarLembreteFeito);
  const toggleAgenda   = useAgendaStore((s) => s.toggleTarefa);

  return useCallback((item: DiaItem) => {
    switch (item.source) {
      case 'rotina':      toggleRotina(date, item.nativeId); break;
      case 'casa':        toggleCasa(date, item.nativeId); break;
      case 'crianca':     toggleKid(date, item.nativeId); break;
      case 'pet':
        if (item.done) desfazerPet(date, item.nativeId);
        else           registrarPet(date, item.nativeId);
        break;
      case 'compromisso': toggleReminder(item.nativeId); break;
      case 'tarefa':      toggleAgenda(date, item.nativeId); break;
    }
  }, [date, toggleRotina, toggleCasa, toggleKid, registrarPet, desfazerPet, toggleReminder, toggleAgenda]);
}

// useCapturaRouter — dados cross-feature para CapturaRapida
export function useCapturaRouter() {
  const adicionarItemCompra = useOrganizaStore((s) => s.adicionarItemCompra);
  const criancas = useKidsStore(useShallow((s) => s.criancas));
  return { adicionarItemCompra, criancas };
}

// useNovaTarefaData — dados cross-feature para AddTarefaDiaSheet
export function useNovaTarefaData() {
  const adicionarTarefaRotina = useRotinaStore((s) => s.adicionarTarefa);
  const criancas = useKidsStore(useShallow((s) => s.criancas));
  return { adicionarTarefaRotina, criancas };
}
