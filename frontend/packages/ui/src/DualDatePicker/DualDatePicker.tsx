"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { convertSolarToLunar } from "@giapha/lunar";
import { FormField } from "../FormField/FormField";
import { Input } from "../Input/Input";

export interface DualDateValue {
  solar: { day: number; month: number; year: number };
  lunarLabel?: string;
}

export interface DualDatePickerProps {
  label?: string;
  value?: DualDateValue;
  onChange?: (value: DualDateValue) => void;
}

function parseDate(value: string): { day: number; month: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function DualDatePicker({ label = "Ngày sinh", value, onChange }: DualDatePickerProps) {
  const initial =
    value?.solar ??
    ({ day: 1, month: 1, year: 1990 } satisfies DualDateValue["solar"]);
  const [solarInput, setSolarInput] = useState(
    `${initial.year}-${String(initial.month).padStart(2, "0")}-${String(initial.day).padStart(2, "0")}`,
  );

  const lunarLabel = useMemo(() => {
    const parsed = parseDate(solarInput);
    if (!parsed) return "—";
    const lunar = convertSolarToLunar(parsed.day, parsed.month, parsed.year);
    const leap = lunar.leap ? " (nhuận)" : "";
    return `${lunar.day}/${lunar.month}/${lunar.year}${leap}`;
  }, [solarInput]);

  const lunarStyle: CSSProperties = {
    marginTop: "var(--spacing-xs)",
    color: "var(--color-heritage-accent)",
    fontFamily: "var(--font-display)",
    fontSize: "var(--font-size-sm)",
  };

  const handleChange = (next: string) => {
    setSolarInput(next);
    const parsed = parseDate(next);
    if (parsed) {
      onChange?.({ solar: parsed, lunarLabel });
    }
  };

  return (
    <FormField label={label} htmlFor="dual-date" hint="Dương lịch — âm lịch tự quy đổi">
      <Input id="dual-date" type="date" value={solarInput} onChange={(e) => handleChange(e.target.value)} />
      <p style={lunarStyle} aria-live="polite">
        Âm lịch: {lunarLabel}
      </p>
    </FormField>
  );
}
