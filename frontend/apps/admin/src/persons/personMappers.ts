import { convertSolarToLunar } from "@giapha/lunar";
import type { PersonDto } from "../api/genealogyApi";
import type { Gender, LifeStatus, PersonRecord, Privacy } from "./types";

function asGender(raw: string | null | undefined): Gender {
  if (raw === "F" || raw === "U") return raw;
  return "M";
}

function asLife(raw: string | null | undefined): LifeStatus {
  const s = (raw ?? "alive").toLowerCase();
  if (s === "deceased" || s === "dead" || s === "mat" || s === "đã mất") return "deceased";
  return "alive";
}

function asPrivacy(raw: string | null | undefined): Privacy {
  if (raw === "public" || raw === "private") return raw;
  return "members";
}

function solarIso(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.slice(0, 10);
}

export function lunarJsonFromSolarIso(iso?: string): string | undefined {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  const lunar = convertSolarToLunar(d, m, y);
  return JSON.stringify({
    day: lunar.day,
    month: lunar.month,
    year: lunar.year,
    leap: lunar.leap,
  });
}

export function fromPersonDto(dto: PersonDto): PersonRecord {
  return {
    id: String(dto.id ?? ""),
    code: dto.code ?? "",
    fullName: dto.fullName ?? "",
    tenHuy: dto.tenHuy ?? undefined,
    gender: asGender(dto.gender),
    lifeStatus: asLife(dto.lifeStatus),
    generation: dto.generation ?? undefined,
    birthSolar: solarIso(dto.birthSolar),
    deathSolar: solarIso(dto.deathSolar),
    privacy: asPrivacy(dto.privacy),
    notes: dto.notes ?? undefined,
  };
}

export function toPersonDto(record: PersonRecord): PersonDto {
  const id = record.id ? Number(record.id) : undefined;
  return {
    id: id != null && Number.isFinite(id) ? id : undefined,
    code: record.code || null,
    fullName: record.fullName,
    tenHuy: record.tenHuy ?? null,
    gender: record.gender,
    lifeStatus: record.lifeStatus,
    generation: record.generation ?? null,
    birthSolar: record.birthSolar ?? null,
    birthLunarJson: lunarJsonFromSolarIso(record.birthSolar) ?? null,
    deathSolar: record.lifeStatus === "deceased" ? (record.deathSolar ?? null) : null,
    deathLunarJson:
      record.lifeStatus === "deceased" ? (lunarJsonFromSolarIso(record.deathSolar) ?? null) : null,
    privacy: record.privacy,
    notes: record.notes ?? null,
  };
}
