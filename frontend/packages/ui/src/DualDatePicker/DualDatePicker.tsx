"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties } from "react";
import { convertSolarToLunar } from "@giapha/lunar";
import { FormField } from "../FormField/FormField";
import { Input } from "../Input/Input";

export interface DualDateValue {
  solar: { day: number; month: number; year: number };
  lunarLabel?: string;
}

export interface DualDatePickerProps {
  label?: string;
  value?: DualDateValue | null;
  onChange?: (value: DualDateValue | null) => void;
  /** Cho phép để trống (không ép ngày mặc định). */
  optional?: boolean;
}

function parseDate(value: string): { day: number; month: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function toIso(solar: DualDateValue["solar"]): string {
  return `${solar.year}-${String(solar.month).padStart(2, "0")}-${String(solar.day).padStart(2, "0")}`;
}

export function DualDatePicker({
  label = "Ngày sinh",
  value,
  onChange,
  optional = false,
}: DualDatePickerProps) {
  const inputId = useId();
  const [solarInput, setSolarInput] = useState(() => (value?.solar ? toIso(value.solar) : ""));

  useEffect(() => {
    setSolarInput(value?.solar ? toIso(value.solar) : "");
  }, [value?.solar?.year, value?.solar?.month, value?.solar?.day]);

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
    if (!next) {
      if (optional) onChange?.(null);
      return;
    }
    const parsed = parseDate(next);
    if (parsed) {
      const lunar = convertSolarToLunar(parsed.day, parsed.month, parsed.year);
      const leap = lunar.leap ? " (nhuận)" : "";
      onChange?.({
        solar: parsed,
        lunarLabel: `${lunar.day}/${lunar.month}/${lunar.year}${leap}`,
      });
    }
  };

  return (
    <FormField label={label} htmlFor={inputId} hint="Dương lịch — âm lịch tự quy đổi">
      <Input
        id={inputId}
        type="date"
        value={solarInput}
        onChange={(e) => handleChange(e.target.value)}
      />
      <p style={lunarStyle} aria-live="polite">
        Âm lịch: {lunarLabel}
      </p>
    </FormField>
  );
}
