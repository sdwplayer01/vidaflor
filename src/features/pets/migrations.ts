// src/features/pets/migrations.ts

export const PETS_VERSION = 1;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  if (fromVersion < 1) {
    s = {
      pets: (s.pets || []).map((p: any) => ({
        id:          p.id ? String(p.id) : String(Math.random()),
        name:        p.name ?? '',
        avatar:      p.avatar ?? '\uD83D\uDC36',
        especie:     p.especie ?? 'outro',
        raca:        p.raca,
        nascimento:  p.nascimento,
        color:       p.color ?? '#79E8A0',
        cuidados:    (p.cuidados || []).map((c: any) => ({
          id:            c.id ? String(c.id) : String(Math.random()),
          tipo:          c.tipo ?? 'outros',
          descricao:     c.descricao ?? '',
          horario:       c.horario,
          frequenciaDia: c.frequenciaDia ?? 1,
        })),
        createdAt: '2024-01-01',
      })),
      activePetId: null,
      done:        {},
    };
    if (s.pets.length > 0) s.activePetId = s.pets[0].id;
  }

  return s;
}
