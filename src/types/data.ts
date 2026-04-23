// src/types/data.ts
// Contrato de dados completo do VidaFlor — single source of truth para todas as interfaces.

// ── Enums e literais ──────────────────────────────────────────────────────────

export type ProfileType = "adult_f" | "adult_m" | "child" | "pet";
export type TransType   = "income" | "expense";
export type TabKey      = "home" | "rotina" | "saude" | "espiritual" | "organiza" | "financas" | "config";
export type ThemeKey    = "pastel" | "terra" | "lilac" | "neutro" | "sage";
export type Priority    = "alta" | "media" | "baixa";

// ── Saúde ──────────────────────────────────────────────────────────────────────

export interface WaterLog {
  goal: number;
  log:  Record<string, number>; // "YYYY-MM-DD" → ml
}

export interface CycleConfig {
  start:  string; // "YYYY-MM-DD"
  len:    number;
  menses: number;
}

export interface Medication {
  id:   string;
  name: string;
  dose: string;
  time: string;
  log:  Record<string, boolean>; // "YYYY-MM-DD" → tomado
}

export interface HealthProfile {
  id:     string;
  name:   string;
  av:     string;
  type:   ProfileType;
  color:  string;
  water:  WaterLog;
  cycle?: CycleConfig;   // undefined em non-adult_f
  meds:   Medication[];
  notes:  Record<string, string>; // "YYYY-MM-DD" → texto
}

export interface HealthData {
  activeProfile: string;
  profiles:      HealthProfile[];
}

// ── Rotina ────────────────────────────────────────────────────────────────────

export interface RotinaTarefa {
  id:   number;
  task: string;
  time: string;
}

export interface RoutineData {
  morning:   RotinaTarefa[];
  afternoon: RotinaTarefa[];
  night:     RotinaTarefa[];
  essential: RotinaTarefa[];
  done:      Record<string, number[]>; // "YYYY-MM-DD" → [id1, id2...]
  essMode:   boolean;
}

// ── Finanças ─────────────────────────────────────────────────────────────────

export interface Installment {
  total:   number;
  current: number;
  groupId: string;
}

export interface Transaction {
  id:          number;
  desc:        string;
  val:         number;
  type:        TransType;
  cat:         string;
  date:        string;
  due?:        string;
  paid:        boolean;
  cardId:      number | null;
  installment: Installment | null;
}

export interface Card {
  id:       number;
  name:     string;
  brand:    string;
  color:    string;
  closeDay: number;
  dueDay:   number;
}

export interface FinanceData {
  transactions: Transaction[];
  cards:        Card[];
  budget:       Record<string, number>; // "YYYY-MM" → valor
}

// ── Espiritual ────────────────────────────────────────────────────────────────

export interface Reading {
  id:      number;
  book:    string;
  chapter: string;
  date:    string;
}

export interface Prayer {
  id:       number;
  person:   string;
  request:  string;
  answered: boolean;
}

export interface SpiritData {
  gratitude: Record<string, string[]>; // "YYYY-MM-DD" → lista
  readings:  Reading[];
  prayers:   Prayer[];
}

// ── Organização ───────────────────────────────────────────────────────────────

export interface ShoppingItem {
  id:   number;
  name: string;
  cat:  string;
  done: boolean;
}

export interface Note {
  id:      number;
  title:   string;
  content: string;
  color:   string;
  date:    string;
}

export interface Reminder {
  id:       number;
  title:    string;
  time:     string;
  date:     string;
  cat:      string;
  priority: Priority;
  done:     boolean;
}

// ── Crianças ──────────────────────────────────────────────────────────────────

export interface KidTask {
  id:   number;
  task: string;
  ic:   string; // emoji
}

export interface Kid {
  id:    number;
  name:  string;
  av:    string;
  age:   number;
  color: string;
  tasks: KidTask[];
}

export interface KidsData {
  children: Kid[];
  done:     Record<string, number[]>; // "YYYY-MM-DD" → [taskId...]
}

// ── Integrações ───────────────────────────────────────────────────────────────

export interface GoogleCalEvent {
  id:    string;
  title: string;
  time:  string;
  date:  string;
  cal:   string;
}

export interface GoogleCalendar {
  id:     string;
  name:   string;
  active: boolean;
}

export interface IntegrationsData {
  google: {
    connected:  boolean;
    email:      string;
    calendars:  GoogleCalendar[];
    events:     GoogleCalEvent[];
  };
}

// ── Root ──────────────────────────────────────────────────────────────────────

export interface AppData {
  _v:           number;
  routine:      RoutineData;
  health:       HealthData;
  finance:      FinanceData;
  spirit:       SpiritData;
  shopping:     { items: ShoppingItem[] };
  notes:        { list: Note[] };
  reminders:    { list: Reminder[] };
  bloom:        { points: Record<string, number> };
  kids:         KidsData;
  integrations: IntegrationsData;
}

// ── Config ────────────────────────────────────────────────────────────────────

export interface DashConfig {
  bloom:     boolean;
  water:     boolean;
  routine:   boolean;
  finance:   boolean;
  cycle:     boolean;
  spirit:    boolean;
  reminders: boolean;
}

export interface AppConfig {
  theme: ThemeKey;
  name:  string;
  dash:  DashConfig;
}

// ── Tema ──────────────────────────────────────────────────────────────────────

export interface Theme {
  key:  ThemeKey;
  name: string;
  e:    string;
  bg:   string;
  surf: string;
  alt:  string;
  bd:   string;
  p:    string;
  pl:   string;
  pd:   string;
  gh:   string;
  tx:   string;
  tm:   string;
  ok:   string;
  wn:   string;
  er:   string;
}
