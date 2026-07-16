import type { PersonRecord } from "./types";

const STORAGE_KEY = "giapha.admin.persons.v1";

const SEED: PersonRecord[] = [
  {
    id: "p1",
    code: "A1",
    fullName: "Hoàng Văn Tổ",
    tenHuy: "Tổ",
    gender: "M",
    lifeStatus: "deceased",
    generation: 1,
    birthSolar: "1850-02-10",
    birthLunarLabel: "—",
    privacy: "public",
    notes: "Thủy tổ chi họ",
  },
  {
    id: "p2",
    code: "A1-sp1",
    fullName: "Nguyễn Thị Tổ Mẫu",
    gender: "F",
    lifeStatus: "deceased",
    generation: 1,
    birthSolar: "1855-08-20",
    privacy: "public",
  },
  {
    id: "p3",
    code: "A2",
    fullName: "Hoàng Văn Trưởng",
    gender: "M",
    lifeStatus: "alive",
    generation: 2,
    birthSolar: "1990-05-01",
    privacy: "members",
    notes: "PII — khách không thấy ngày sinh đầy đủ trên API public",
  },
];

function readAll(): PersonRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as PersonRecord[];
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function writeAll(rows: PersonRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function listPersons(): PersonRecord[] {
  return readAll().sort((a, b) => a.code.localeCompare(b.code, "vi"));
}

export function getPerson(id: string): PersonRecord | undefined {
  return readAll().find((p) => p.id === id);
}

export function upsertPerson(record: PersonRecord): PersonRecord {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  writeAll(all);
  return record;
}

export function deletePerson(id: string): void {
  writeAll(readAll().filter((p) => p.id !== id));
}

export function nextTempCode(existing: PersonRecord[]): string {
  const nums = existing
    .map((p) => /^A(\d+)$/i.exec(p.code)?.[1])
    .filter(Boolean)
    .map((n) => Number(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `A${max + 1}`;
}
