"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { convertSolarToLunar, getCanChiYear, type LunarDate } from "@giapha/lunar";
import { FormField } from "../FormField/FormField";

// ── Public types (backward-compatible) ───────────────────────────────────────

export interface DualDateValue {
  solar: { day: number; month: number; year: number };
  lunarLabel?: string;
}

export interface DualDateRangeValue {
  from: DualDateValue | null;
  to: DualDateValue | null;
}

export interface DualDatePickerProps {
  label?: string;
  value?: DualDateValue | null;
  onChange?: (value: DualDateValue | null) => void;
  optional?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface DualDateRangePickerProps {
  value?: DualDateRangeValue | null;
  onChange?: (value: DualDateRangeValue | null) => void;
  optional?: boolean;
  disabled?: boolean;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

// ── Internal types ────────────────────────────────────────────────────────────

interface S { day: number; month: number; year: number }
interface DCell { solar: S; lunar: LunarDate; otherMonth: boolean }
type CMode = "solar" | "lunar";

// ── CSS (injected once into <head>) ───────────────────────────────────────────

const _CSS = `
.ddp-root{position:relative;font-family:var(--font-body)}
.ddp-trigger{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--color-surface-card);border:1.5px solid var(--color-border-default);border-radius:var(--radius-sm);cursor:pointer;min-width:180px;transition:border-color .15s;user-select:none}
.ddp-trigger:hover,.ddp-trigger--open{border-color:var(--color-heritage-accent)}
.ddp-trigger--open{box-shadow:0 0 0 3px color-mix(in srgb,var(--color-heritage-accent) 16%,transparent)}
.ddp-trigger--disabled{opacity:.55;cursor:not-allowed;pointer-events:none}
.ddp-icon{font-size:14px;color:var(--color-text-muted);flex-shrink:0}
.ddp-icon--act{color:var(--color-heritage-accent)}
.ddp-val-wrap{flex:1;min-width:0}
.ddp-val{font-size:13px;color:var(--color-text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ddp-val--ph{color:var(--color-text-muted)}
.ddp-lunar-sub{font-size:10px;color:var(--color-heritage-accent);font-weight:600;line-height:1.3;margin-top:1px}
.ddp-lunar-sub--son{color:var(--color-son-500)}
.ddp-clr{font-size:11px;color:var(--color-text-muted);cursor:pointer;padding:2px 4px;border-radius:3px;border:none;background:none;flex-shrink:0}
.ddp-clr:hover{color:var(--color-text-primary);background:var(--color-surface-sunken)}

.ddp-range-wrap{display:flex;align-items:stretch}
.ddp-range-trigger{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--color-surface-card);border:1.5px solid var(--color-border-default);cursor:pointer;min-width:160px;transition:border-color .15s;user-select:none}
.ddp-range-trigger--from{border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none}
.ddp-range-trigger--to{border-radius:0 var(--radius-sm) var(--radius-sm) 0}
.ddp-range-trigger--open,.ddp-range-trigger:hover{border-color:var(--color-heritage-accent)}
.ddp-range-sep{display:flex;align-items:center;padding:0 8px;background:var(--color-surface-card);border-top:1.5px solid var(--color-border-default);border-bottom:1.5px solid var(--color-border-default);color:var(--color-text-muted);font-size:13px}

.ddp-panel{position:fixed;z-index:9999;display:flex;background:var(--color-surface-card);border:1px solid var(--color-border-default);border-radius:var(--radius-md);box-shadow:0 8px 28px rgba(0,0,0,.18)}

.ddp-presets{width:144px;border-right:1px solid var(--color-border-default);background:var(--color-surface-sunken);padding:8px 0;overflow-y:auto;flex-shrink:0}
.ddp-presets-hd{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:var(--color-text-muted);padding:6px 14px 2px}
.ddp-preset{padding:6px 14px;font-size:12px;color:var(--color-text-secondary);cursor:pointer;border-left:2px solid transparent;white-space:nowrap}
.ddp-preset:hover{background:color-mix(in srgb,var(--color-border-default) 60%,var(--color-surface-sunken));border-left-color:var(--color-heritage-line)}
.ddp-preset--on{background:var(--color-heritage-soft);border-left-color:var(--color-heritage-accent);color:var(--color-heritage-deep);font-weight:700}
.ddp-pre-div{height:1px;background:var(--color-border-default);margin:5px 12px}

.ddp-cal{display:flex;flex-direction:column}
.ddp-toolbar{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 8px;border-bottom:1px solid var(--color-border-default);gap:10px}
.ddp-toolbar-info{font-size:12px;color:var(--color-text-primary)}
.ddp-months{display:flex}

.ddp-mode{display:flex;background:var(--color-surface-sunken);border-radius:20px;padding:3px;gap:2px;align-items:center}
.ddp-mode-btn{padding:4px 11px;border-radius:16px;font-size:11px;font-weight:700;cursor:pointer;border:none;background:none;color:var(--color-text-muted);transition:all .15s;font-family:var(--font-body)}
.ddp-mode-btn--on{background:var(--color-surface-card);color:var(--color-heritage-accent);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.ddp-mode-btn--son{color:var(--color-son-500) !important}
.ddp-ym-jumper{display:flex;align-items:center;gap:4px}
.ddp-ym-jumper select{padding:4px 8px;border:1px solid var(--color-border-default);border-radius:var(--radius-sm);font-size:12px;background:var(--color-surface-card);color:var(--color-text-primary);outline:none;cursor:pointer;font-family:var(--font-body)}
.ddp-ym-jumper select:focus{border-color:var(--color-heritage-accent)}

.ddp-month{padding:10px 12px;width:282px;flex-shrink:0}
.ddp-month+.ddp-month{border-left:1px solid var(--color-border-default)}
.ddp-month-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.ddp-mnav{width:26px;height:26px;border:1px solid var(--color-border-default);border-radius:var(--radius-sm);background:var(--color-surface-card);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--color-text-muted);transition:all .1s;font-family:inherit}
.ddp-mnav:hover{border-color:var(--color-heritage-accent);color:var(--color-heritage-accent)}
.ddp-mnav:disabled{opacity:.3;cursor:not-allowed}
.ddp-mlbl{font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--color-text-primary);display:flex;flex-direction:column;align-items:center;gap:1px;cursor:default;text-align:center}
.ddp-mlbl-lunar{font-size:9px;color:var(--color-heritage-accent);font-weight:600;font-family:var(--font-body)}

.ddp-dows{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:3px}
.ddp-dow{text-align:center;font-size:10px;font-weight:700;color:var(--color-text-muted);padding:3px 0}
.ddp-dow--we{color:var(--color-son-500)}

.ddp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px}
.ddp-day{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px 1px;border-radius:var(--radius-sm);cursor:pointer;min-height:38px;border:1.5px solid transparent;transition:background .08s;position:relative}
.ddp-day:hover:not(.ddp-day--dis):not(.ddp-day--sel):not(.ddp-day--rs):not(.ddp-day--re){background:var(--color-surface-sunken)}
.ddp-day--oth{opacity:.34}
.ddp-day--dis{opacity:.3;cursor:not-allowed}
.ddp-day--today{border-color:var(--color-heritage-accent)}
.ddp-day--today .ddp-s{color:var(--color-heritage-deep);font-weight:800}
.ddp-day--sel,.ddp-day--rs,.ddp-day--re{background:var(--color-heritage-accent) !important;border-color:var(--color-heritage-accent) !important}
.ddp-day--sel .ddp-s,.ddp-day--rs .ddp-s,.ddp-day--re .ddp-s{color:var(--color-text-on-brand) !important;font-weight:800}
.ddp-day--sel .ddp-l,.ddp-day--rs .ddp-l,.ddp-day--re .ddp-l{color:rgba(255,255,255,.8) !important;font-weight:normal}
.ddp-day--rs{border-radius:var(--radius-sm) 0 0 var(--radius-sm)}
.ddp-day--re{border-radius:0 var(--radius-sm) var(--radius-sm) 0}
.ddp-day--ir{background:var(--color-heritage-soft);border-radius:0;border-color:transparent}
.ddp-day--hr{background:color-mix(in srgb,var(--color-heritage-soft) 55%,var(--color-surface-card));border-radius:0;border-color:transparent}
.ddp-day--ram .ddp-l{color:var(--color-status-bad-l) !important;font-weight:700}
.ddp-day--mong .ddp-l{color:var(--color-status-good-l) !important;font-weight:700}

.ddp-s{font-size:13px;font-weight:600;color:var(--color-text-primary);line-height:1.1}
.ddp-l{font-size:9px;color:var(--color-text-muted);line-height:1.3;white-space:nowrap}

.ddp-panel--lunar .ddp-s{font-size:9px;font-weight:400;color:var(--color-text-muted);line-height:1.2}
.ddp-panel--lunar .ddp-l{font-size:13px;font-weight:600;color:var(--color-son-500);line-height:1.1}
.ddp-panel--lunar .ddp-day--today{border-color:var(--color-son-500)}
.ddp-panel--lunar .ddp-day--today .ddp-l{color:var(--color-son-500);font-weight:800}
.ddp-panel--lunar .ddp-day--sel,.ddp-panel--lunar .ddp-day--rs,.ddp-panel--lunar .ddp-day--re{background:var(--color-son-500) !important;border-color:var(--color-son-500) !important}
.ddp-panel--lunar .ddp-day--sel .ddp-l,.ddp-panel--lunar .ddp-day--rs .ddp-l,.ddp-panel--lunar .ddp-day--re .ddp-l{color:var(--color-text-on-brand) !important;font-weight:800}
.ddp-panel--lunar .ddp-day--sel .ddp-s,.ddp-panel--lunar .ddp-day--rs .ddp-s,.ddp-panel--lunar .ddp-day--re .ddp-s{color:rgba(255,255,255,.68) !important}
.ddp-panel--lunar .ddp-day--ir{background:color-mix(in srgb,var(--color-son-500) 10%,var(--color-surface-card))}
.ddp-panel--lunar .ddp-day--hr{background:color-mix(in srgb,var(--color-son-500) 6%,var(--color-surface-card))}
.ddp-panel--lunar .ddp-mode-btn--on{color:var(--color-son-500) !important}

.ddp-foot{display:flex;align-items:center;justify-content:space-between;padding:9px 14px;border-top:1px solid var(--color-border-default);background:var(--color-surface-sunken);gap:10px}
.ddp-foot-info{display:flex;flex-direction:column;gap:2px}
.ddp-foot-date{font-size:12px;color:var(--color-text-primary);font-family:var(--font-body)}
.ddp-foot-lunar{font-size:10px;color:var(--color-heritage-accent);font-weight:600;font-family:var(--font-body)}
.ddp-foot-btns{display:flex;gap:6px;align-items:center}
.ddp-btn-ghost{padding:5px 12px;border:1px solid var(--color-border-default);border-radius:var(--radius-sm);font-size:12px;background:var(--color-surface-card);color:var(--color-text-primary);cursor:pointer;font-weight:600;font-family:var(--font-body)}
.ddp-btn-ghost:hover{border-color:var(--color-heritage-accent)}
.ddp-btn-ok{padding:5px 16px;border:none;border-radius:var(--radius-sm);font-size:12px;background:var(--color-action-primary-bg);color:var(--color-action-primary-fg);cursor:pointer;font-weight:700;font-family:var(--font-body)}
.ddp-btn-ok:hover{background:var(--color-action-primary-bg-hover)}
.ddp-btn-ok:disabled{opacity:.5;cursor:not-allowed}
`;

let _cssInjected = false;
function ensureCss(): void {
  if (_cssInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.setAttribute("data-ddp", "1");
  el.textContent = _CSS;
  document.head.appendChild(el);
  _cssInjected = true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["T.1","T.2","T.3","T.4","T.5","T.6","T.7","T.8","T.9","T.10","T.11","T.12"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function todaySolar(): S {
  const d = new Date();
  return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
}

function solarEq(a: S, b: S): boolean {
  return a.day === b.day && a.month === b.month && a.year === b.year;
}

function solarLt(a: S, b: S): boolean {
  if (a.year !== b.year) return a.year < b.year;
  if (a.month !== b.month) return a.month < b.month;
  return a.day < b.day;
}

function solarLte(a: S, b: S): boolean {
  return solarEq(a, b) || solarLt(a, b);
}

function fmtDisplay(s: S): string {
  return `${String(s.day).padStart(2, "0")}/${String(s.month).padStart(2, "0")}/${s.year}`;
}

function buildLunarLabel(s: S): string {
  const l = convertSolarToLunar(s.day, s.month, s.year);
  return `${l.day}/${l.month}${l.leap ? " (nhuận)" : ""}`;
}

function buildFullLunarLabel(s: S): string {
  const l = convertSolarToLunar(s.day, s.month, s.year);
  const cc = getCanChiYear(l.year);
  const leap = l.leap ? " (nhuận)" : "";
  return `${l.day} tháng ${l.month}${leap} năm ${cc.label} ÂL`;
}

function makeDV(s: S): DualDateValue {
  return { solar: s, lunarLabel: buildFullLunarLabel(s) };
}

function buildMonthGrid(year: number, month: number): DCell[] {
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Mon=0
  const total = daysInMonth(year, month);
  const cells: DCell[] = [];

  // Trailing prev-month days
  if (firstDow > 0) {
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    const pmDays = daysInMonth(py, pm);
    for (let i = firstDow - 1; i >= 0; i--) {
      const d = pmDays - i;
      cells.push({ solar: { day: d, month: pm, year: py }, lunar: convertSolarToLunar(d, pm, py), otherMonth: true });
    }
  }

  // Current month
  for (let d = 1; d <= total; d++) {
    cells.push({ solar: { day: d, month, year }, lunar: convertSolarToLunar(d, month, year), otherMonth: false });
  }

  // Leading next-month days to fill grid
  const nm = month === 12 ? 1 : month + 1;
  const ny = month === 12 ? year + 1 : year;
  let nd = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ solar: { day: nd, month: nm, year: ny }, lunar: convertSolarToLunar(nd, nm, ny), otherMonth: true });
    nd++;
  }
  return cells;
}

function lunarMonthRangeLabel(year: number, month: number): string {
  const firstLunar = convertSolarToLunar(1, month, year);
  const lastLunar = convertSolarToLunar(daysInMonth(year, month), month, year);
  if (firstLunar.month === lastLunar.month) return `T.${firstLunar.month} ÂL`;
  return `T.${firstLunar.month}–${lastLunar.month} ÂL`;
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  let m = month + delta;
  let y = year;
  while (m > 12) { m -= 12; y++; }
  while (m < 1) { m += 12; y--; }
  return { year: y, month: m };
}

// ── Smart floating position ───────────────────────────────────────────────────

const _GAP = 6;    // px between trigger bottom and panel top
const _MARGIN = 8; // min distance from viewport edge

interface _FloatStyle {
  top: number;
  left: number;
  maxHeight: number;
  overflowY?: "auto";
  visibility: "hidden" | "visible";
}

function computeFloatPos(trig: DOMRect, pw: number, ph: number): _FloatStyle {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // ── Vertical: prefer below, flip above if more space ──
  const spaceBelow = vh - trig.bottom - _MARGIN;
  const spaceAbove = trig.top - _MARGIN;
  const fitsBelow = spaceBelow >= ph;
  const placeBelow = fitsBelow || spaceBelow >= spaceAbove;

  let top: number;
  let maxHeight: number;
  if (placeBelow) {
    top = trig.bottom + _GAP;
    maxHeight = Math.max(200, spaceBelow);
  } else {
    maxHeight = Math.max(200, spaceAbove);
    top = trig.top - _GAP - Math.min(ph, maxHeight);
  }

  // ── Horizontal: left-align to trigger, flip/clamp if needed ──
  let left = trig.left;

  // If panel overflows right edge → try right-aligning to trigger's right edge
  if (left + pw > vw - _MARGIN) {
    left = trig.right - pw;
  }
  // Hard clamp to both edges
  left = Math.max(_MARGIN, Math.min(left, vw - pw - _MARGIN));

  return {
    top,
    left,
    maxHeight,
    overflowY: ph > maxHeight ? "auto" : undefined,
    visibility: "visible",
  };
}

/**
 * Measures panel size after render then computes the best fixed-position
 * placement (flip above/right when viewport space is tight).
 * Returns a CSSProperties to spread onto the panel div.
 */
function useSmartPos(
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
  open: boolean,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden", top: 0, left: 0 });

  const reposition = useCallback(() => {
    const trig = triggerRef.current;
    const panel = panelRef.current;
    if (!trig || !panel) return;
    const trigRect = trig.getBoundingClientRect();
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    if (!pw || !ph) return;
    const pos = computeFloatPos(trigRect, pw, ph);
    setStyle(pos);
  }, [triggerRef, panelRef]);

  // Run synchronously before paint — panel is in DOM but not yet painted,
  // so offsetWidth/Height are available and we can position without flicker.
  useLayoutEffect(() => {
    if (!open) {
      setStyle({ visibility: "hidden", top: 0, left: 0 });
      return;
    }
    reposition();
  }, [open, reposition]);

  // Keep aligned on scroll / resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  return style;
}

// ── Range presets ─────────────────────────────────────────────────────────────

interface RPreset { label: string; group: string; get: () => DualDateRangeValue }

function buildRangePresets(): RPreset[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  const make = (day: number, month: number, year: number): DualDateValue =>
    makeDV({ day, month, year });

  const daysAgo = (n: number): S => {
    const dt = new Date(now); dt.setDate(d - n);
    return { day: dt.getDate(), month: dt.getMonth() + 1, year: dt.getFullYear() };
  };

  const dowOff = (now.getDay() + 6) % 7; // Mon=0
  const weekStart = daysAgo(dowOff);
  const weekEndDate = new Date(now); weekEndDate.setDate(d - dowOff + 6);
  const weekEndS: S = { day: weekEndDate.getDate(), month: weekEndDate.getMonth()+1, year: weekEndDate.getFullYear() };

  const lastWeekStartDate = new Date(now); lastWeekStartDate.setDate(d - dowOff - 7);
  const lastWeekEndDate = new Date(now); lastWeekEndDate.setDate(d - dowOff - 1);
  const lastWeekStart: S = { day: lastWeekStartDate.getDate(), month: lastWeekStartDate.getMonth()+1, year: lastWeekStartDate.getFullYear() };
  const lastWeekEnd: S = { day: lastWeekEndDate.getDate(), month: lastWeekEndDate.getMonth()+1, year: lastWeekEndDate.getFullYear() };

  const lm = m === 1 ? 12 : m - 1;
  const ly = m === 1 ? y - 1 : y;

  const q = Math.ceil(m / 3);
  const qsm = (q - 1) * 3 + 1;
  const qem = qsm + 2;

  const pq = q === 1 ? 4 : q - 1;
  const pqy = q === 1 ? y - 1 : y;
  const pqsm = (pq - 1) * 3 + 1;
  const pqem = pqsm + 2;

  const ago7 = daysAgo(6);

  return [
    { label: "Hôm nay", group: "Ngày", get: () => ({ from: make(d, m, y), to: make(d, m, y) }) },
    { label: "Hôm qua", group: "Ngày", get: () => { const yS = daysAgo(1); return { from: make(yS.day, yS.month, yS.year), to: make(yS.day, yS.month, yS.year) }; } },
    { label: "7 ngày qua", group: "Ngày", get: () => ({ from: make(ago7.day, ago7.month, ago7.year), to: make(d, m, y) }) },
    { label: "Tuần này", group: "Tuần", get: () => ({ from: make(weekStart.day, weekStart.month, weekStart.year), to: make(weekEndS.day, weekEndS.month, weekEndS.year) }) },
    { label: "Tuần trước", group: "Tuần", get: () => ({ from: make(lastWeekStart.day, lastWeekStart.month, lastWeekStart.year), to: make(lastWeekEnd.day, lastWeekEnd.month, lastWeekEnd.year) }) },
    { label: "Tháng này", group: "Tháng", get: () => ({ from: make(1, m, y), to: make(daysInMonth(y, m), m, y) }) },
    { label: "Tháng trước", group: "Tháng", get: () => ({ from: make(1, lm, ly), to: make(daysInMonth(ly, lm), lm, ly) }) },
    { label: `Q${q} — ${y}`, group: "Quý", get: () => ({ from: make(1, qsm, y), to: make(daysInMonth(y, qem), qem, y) }) },
    { label: `Q${pq} — ${pqy}`, group: "Quý", get: () => ({ from: make(1, pqsm, pqy), to: make(daysInMonth(pqy, pqem), pqem, pqy) }) },
    { label: `Năm ${y}`, group: "Năm", get: () => ({ from: make(1, 1, y), to: make(31, 12, y) }) },
    { label: `Năm ${y - 1}`, group: "Năm", get: () => ({ from: make(1, 1, y - 1), to: make(31, 12, y - 1) }) },
  ];
}

// ── CalGrid sub-component ────────────────────────────────────────────────────

interface CalGridProps {
  year: number;
  month: number;
  selected?: S | null;
  rangeFrom?: S | null;
  rangeTo?: S | null;
  hoverDate?: S | null;
  today: S;
  onSelect: (s: S) => void;
  onHover?: (s: S | null) => void;
}

const CalGrid = memo(function CalGrid({ year, month, selected, rangeFrom, rangeTo, hoverDate, today, onSelect, onHover }: CalGridProps) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <div className="ddp-grid">
      {cells.map((cell) => {
        const s = cell.solar;
        const lunarStr = `${cell.lunar.day}/${cell.lunar.month}${cell.lunar.leap ? "*" : ""}`;
        const solarStr = String(s.day);

        const isSel = selected ? solarEq(s, selected) : false;
        const isRs = rangeFrom ? solarEq(s, rangeFrom) : false;
        const isRe = rangeTo ? solarEq(s, rangeTo) : false;
        const isIr = rangeFrom && rangeTo
          ? solarLt(rangeFrom, s) && solarLt(s, rangeTo)
          : false;
        // hover range preview: from rangeFrom up to hoverDate
        const isHr = rangeFrom && !rangeTo && hoverDate
          ? solarLt(rangeFrom, s) && solarLte(s, hoverDate)
          : false;
        const isToday = solarEq(s, today);
        const isRam = cell.lunar.day === 15;
        const isMong = cell.lunar.day === 1;
        const isActive = isSel || isRs || isRe;

        const cls = [
          "ddp-day",
          cell.otherMonth && "ddp-day--oth",
          isToday && "ddp-day--today",
          isSel && "ddp-day--sel",
          isRs && "ddp-day--rs",
          isRe && "ddp-day--re",
          isIr && "ddp-day--ir",
          isHr && !isActive && "ddp-day--hr",
          isRam && !isActive && "ddp-day--ram",
          isMong && !isActive && "ddp-day--mong",
        ].filter(Boolean).join(" ");

        return (
          <div
            key={`${s.year}-${s.month}-${s.day}`}
            className={cls}
            role="button"
            tabIndex={0}
            aria-label={`${fmtDisplay(s)}, âm lịch ${lunarStr}`}
            onClick={() => onSelect(s)}
            onMouseEnter={() => onHover?.(s)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(s); } }}
          >
            <span className="ddp-s">{solarStr}</span>
            <span className="ddp-l">{lunarStr}</span>
          </div>
        );
      })}
    </div>
  );
});

// ── Presets sidebar ───────────────────────────────────────────────────────────

interface PresetsSidebarProps {
  presets: RPreset[];
  activeLabel?: string;
  onSelect: (p: RPreset) => void;
}

function PresetsSidebar({ presets, activeLabel, onSelect }: PresetsSidebarProps) {
  let lastGroup = "";
  return (
    <div className="ddp-presets">
      {presets.map((p, i) => {
        const showHd = p.group !== lastGroup;
        lastGroup = p.group;
        return (
          <div key={i}>
            {showHd && <div className="ddp-presets-hd">{p.group}</div>}
            <div
              className={`ddp-preset${p.label === activeLabel ? " ddp-preset--on" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(p)}
              onKeyDown={(e) => { if (e.key === "Enter") onSelect(p); }}
            >
              {p.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── YM jumper (selects in toolbar) ───────────────────────────────────────────

interface YMJumperProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

function YMJumper({ year, month, onChange }: YMJumperProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="ddp-ym-jumper">
      <select
        value={month}
        aria-label="Chọn tháng"
        onChange={(e) => onChange(year, Number(e.target.value))}
      >
        {MONTH_SHORT.map((lbl, idx) => (
          <option key={idx + 1} value={idx + 1}>{lbl}</option>
        ))}
      </select>
      <select
        value={year}
        aria-label="Chọn năm"
        onChange={(e) => onChange(Number(e.target.value), month)}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

// ── DualDatePicker (single date) ──────────────────────────────────────────────

export function DualDatePicker({
  label,
  value,
  onChange,
  optional = false,
  placeholder = "dd/mm/yyyy",
  disabled = false,
}: DualDatePickerProps) {
  ensureCss();

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CMode>("solar");
  const [vy, setVy] = useState(() => value?.solar?.year ?? new Date().getFullYear());
  const [vm, setVm] = useState(() => value?.solar?.month ?? new Date().getMonth() + 1);
  const today = useMemo(todaySolar, []);

  const panelStyle = useSmartPos(triggerRef, panelRef, open);

  // Single date picker presets
  const singlePresets: RPreset[] = useMemo(() => {
    const d = today.day; const m = today.month; const y = today.year;
    const make = (day: number, month: number, year: number): DualDateValue => makeDV({ day, month, year });
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    return [
      { label: "Hôm nay", group: "Ngày", get: () => ({ from: make(d, m, y), to: null }) },
      { label: "Hôm qua", group: "Ngày", get: () => ({ from: make(yest.getDate(), yest.getMonth()+1, yest.getFullYear()), to: null }) },
    ];
  }, [today]);

  const openPanel = useCallback(() => {
    if (disabled) return;
    if (value?.solar) { setVy(value.solar.year); setVm(value.solar.month); }
    else { setVy(today.year); setVm(today.month); }
    setOpen(true);
  }, [disabled, value, today]);

  const closePanel = useCallback(() => setOpen(false), []);

  const handleSelect = useCallback((s: S) => {
    onChange?.(makeDV(s));
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (optional) onChange?.(null);
  }, [optional, onChange]);

  const handlePreset = useCallback((p: RPreset) => {
    const rv = p.get();
    if (rv.from) { onChange?.(rv.from); setOpen(false); }
  }, [onChange]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const lunarRangeLabel = useMemo(() => lunarMonthRangeLabel(vy, vm), [vy, vm]);
  const lunarLabel = value?.lunarLabel ?? (value?.solar ? buildLunarLabel(value.solar) : null);
  const hasValue = !!value?.solar;
  const displayVal = hasValue ? fmtDisplay(value!.solar) : null;

  const picker = (
    <div ref={rootRef} className="ddp-root">
      <div
        ref={triggerRef}
        className={`ddp-trigger${open ? " ddp-trigger--open" : ""}${disabled ? " ddp-trigger--disabled" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={open ? closePanel : openPanel}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open ? closePanel() : openPanel(); } }}
      >
        <span className={`ddp-icon${open ? " ddp-icon--act" : ""}`}>📅</span>
        <div className="ddp-val-wrap">
          <div className={`ddp-val${hasValue ? "" : " ddp-val--ph"}`}>
            {displayVal ?? placeholder}
          </div>
          {lunarLabel && <div className={`ddp-lunar-sub${mode === "lunar" ? " ddp-lunar-sub--son" : ""}`}>{lunarLabel}</div>}
        </div>
        {hasValue && optional && (
          <button className="ddp-clr" aria-label="Xóa" onClick={handleClear} tabIndex={-1}>✕</button>
        )}
      </div>

      {open && (
        <div
          ref={panelRef}
          className={`ddp-panel${mode === "lunar" ? " ddp-panel--lunar" : ""}`}
          style={panelStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Chọn ngày"
          data-ddp-panel="1"
        >
          {/* Single-date presets (Today / Yesterday) */}
          <div className="ddp-presets" style={{ width: 120 }}>
            <div className="ddp-presets-hd">Ngày</div>
            {singlePresets.map((p, i) => (
              <div
                key={i}
                className={`ddp-preset${hasValue && displayVal === fmtDisplay(p.get().from!.solar) ? " ddp-preset--on" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => handlePreset(p)}
                onKeyDown={(e) => { if (e.key === "Enter") handlePreset(p); }}
              >
                {p.label}
              </div>
            ))}
          </div>

          <div className="ddp-cal">
            {/* Toolbar */}
            <div className="ddp-toolbar">
              <div className="ddp-mode" role="group" aria-label="Chế độ lịch">
                <button
                  className={`ddp-mode-btn${mode === "solar" ? " ddp-mode-btn--on" : ""}`}
                  onClick={() => setMode("solar")}
                  aria-pressed={mode === "solar"}
                >☀ Dương</button>
                <button
                  className={`ddp-mode-btn${mode === "lunar" ? " ddp-mode-btn--on ddp-mode-btn--son" : ""}`}
                  onClick={() => setMode("lunar")}
                  aria-pressed={mode === "lunar"}
                >🌙 Âm</button>
              </div>
              <YMJumper year={vy} month={vm} onChange={(y, m) => { setVy(y); setVm(m); }} />
            </div>

            {/* Month */}
            <div className="ddp-months">
              <div className="ddp-month">
                <div className="ddp-month-hd">
                  <button className="ddp-mnav" aria-label="Tháng trước" onClick={() => { const r = addMonths(vy, vm, -1); setVy(r.year); setVm(r.month); }}>‹</button>
                  <div className="ddp-mlbl">
                    Tháng {vm} năm {vy}
                    <span className="ddp-mlbl-lunar">{lunarRangeLabel}</span>
                  </div>
                  <button className="ddp-mnav" aria-label="Tháng sau" onClick={() => { const r = addMonths(vy, vm, 1); setVy(r.year); setVm(r.month); }}>›</button>
                </div>
                <div className="ddp-dows" role="row">
                  {["T2","T3","T4","T5","T6","T7","CN"].map((d, i) => (
                    <div key={d} className={`ddp-dow${i >= 5 ? " ddp-dow--we" : ""}`} role="columnheader">{d}</div>
                  ))}
                </div>
                <CalGrid
                  year={vy} month={vm}
                  selected={value?.solar}
                  today={today}
                  onSelect={handleSelect}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="ddp-foot">
              <div className="ddp-foot-info" aria-live="polite">
                {hasValue ? (
                  <>
                    <div className="ddp-foot-date">Đã chọn: <strong>{displayVal}</strong></div>
                    <div className="ddp-foot-lunar">{value!.lunarLabel ?? buildLunarLabel(value!.solar)}</div>
                  </>
                ) : (
                  <div className="ddp-foot-date" style={{ color: "var(--color-text-muted)" }}>Chưa chọn ngày</div>
                )}
              </div>
              <div className="ddp-foot-btns">
                {hasValue && optional && (
                  <button className="ddp-btn-ghost" onClick={() => { onChange?.(null); setOpen(false); }}>Xóa</button>
                )}
                <button className="ddp-btn-ok" onClick={closePanel}>Xong</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!label) return picker;
  return (
    <FormField label={label} hint="Dương lịch — âm lịch tự quy đổi">
      {picker}
    </FormField>
  );
}

// ── DualDateRangePicker ───────────────────────────────────────────────────────

export function DualDateRangePicker({
  value,
  onChange,
  optional = false,
  disabled = false,
  fromPlaceholder = "Từ ngày",
  toPlaceholder = "Đến ngày",
}: DualDateRangePickerProps) {
  ensureCss();

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CMode>("solar");
  const [vy, setVy] = useState(() => new Date().getFullYear());
  const [vm, setVm] = useState(() => new Date().getMonth() + 1);
  // Pending = user clicked "from", waiting for "to"
  const [pendingFrom, setPendingFrom] = useState<S | null>(null);
  const [hoverDate, setHoverDate] = useState<S | null>(null);
  const [activePreset, setActivePreset] = useState<string | undefined>();
  const today = useMemo(todaySolar, []);
  const presets = useMemo(buildRangePresets, []);

  const panelStyle = useSmartPos(triggerRef, panelRef, open);

  const from = value?.from?.solar ?? null;
  const to = value?.to?.solar ?? null;
  // While pending (first date clicked, waiting for second), treat pendingFrom as rangeFrom
  const displayFrom = pendingFrom ?? from;
  const displayTo = pendingFrom ? null : to;

  const openPanel = useCallback(() => {
    if (disabled) return;
    setPendingFrom(null);
    setHoverDate(null);
    const v = from ?? today;
    setVy(v.year); setVm(v.month);
    setOpen(true);
  }, [disabled, from, today]);

  const closePanel = useCallback(() => {
    setOpen(false);
    setPendingFrom(null);
    setHoverDate(null);
  }, []);

  const handleSelect = useCallback((s: S) => {
    if (!pendingFrom) {
      // First click: set as from, wait for to
      setPendingFrom(s);
      setHoverDate(null);
      setActivePreset(undefined);
    } else {
      // Second click: commit range
      let fromS = pendingFrom;
      let toS = s;
      if (solarLt(toS, fromS)) [fromS, toS] = [toS, fromS];
      onChange?.({ from: makeDV(fromS), to: makeDV(toS) });
      setPendingFrom(null);
      setHoverDate(null);
      setOpen(false);
    }
  }, [pendingFrom, onChange]);

  const handlePreset = useCallback((p: RPreset) => {
    const rv = p.get();
    onChange?.(rv);
    setActivePreset(p.label);
    setPendingFrom(null);
    setOpen(false);
  }, [onChange]);

  // Close on outside/Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closePanel();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePanel(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, closePanel]);

  const { year: rvy, month: rvm } = useMemo(() => addMonths(vy, vm, 1), [vy, vm]);

  const leftLunarLabel = useMemo(() => lunarMonthRangeLabel(vy, vm), [vy, vm]);
  const rightLunarLabel = useMemo(() => lunarMonthRangeLabel(rvy, rvm), [rvy, rvm]);

  const fromDisplay = from ? fmtDisplay(from) : null;
  const fromLunar = from ? buildLunarLabel(from) : null;
  const toDisplay = to ? fmtDisplay(to) : null;
  const toLunar = to ? buildLunarLabel(to) : null;

  const rangeInfoText = useMemo(() => {
    if (!from || !to) return null;
    const ms = new Date(to.year, to.month - 1, to.day).getTime() - new Date(from.year, from.month - 1, from.day).getTime();
    const days = Math.round(ms / 86400000) + 1;
    return `${days} ngày`;
  }, [from, to]);

  return (
    <div ref={rootRef} className="ddp-root">
      <div ref={triggerRef} className="ddp-range-wrap" role="group" aria-label="Chọn khoảng ngày">
        <div
          className={`ddp-range-trigger ddp-range-trigger--from${open ? " ddp-range-trigger--open" : ""}`}
          role="button" tabIndex={disabled ? -1 : 0}
          onClick={open ? closePanel : openPanel}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open ? closePanel() : openPanel(); } }}
        >
          <span className="ddp-icon">📅</span>
          <div className="ddp-val-wrap">
            <div className={`ddp-val${fromDisplay ? "" : " ddp-val--ph"}`}>{fromDisplay ?? fromPlaceholder}</div>
            {fromLunar && <div className="ddp-lunar-sub">{fromLunar}</div>}
          </div>
        </div>
        <div className="ddp-range-sep">→</div>
        <div
          className={`ddp-range-trigger ddp-range-trigger--to${open ? " ddp-range-trigger--open" : ""}`}
          role="button" tabIndex={disabled ? -1 : 0}
          onClick={open ? closePanel : openPanel}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open ? closePanel() : openPanel(); } }}
        >
          <div className="ddp-val-wrap">
            <div className={`ddp-val${toDisplay ? "" : " ddp-val--ph"}`}>{toDisplay ?? toPlaceholder}</div>
            {toLunar && <div className="ddp-lunar-sub">{toLunar}</div>}
          </div>
          {(from || to) && optional && (
            <button className="ddp-clr" aria-label="Xóa khoảng ngày"
              onClick={(e) => { e.stopPropagation(); onChange?.(null); setActivePreset(undefined); }}
              tabIndex={-1}
            >✕</button>
          )}
        </div>
      </div>

      {open && (
        <div
          ref={panelRef}
          className={`ddp-panel${mode === "lunar" ? " ddp-panel--lunar" : ""}`}
          style={panelStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Chọn khoảng ngày"
          data-ddp-range-panel="1"
        >
          <PresetsSidebar presets={presets} activeLabel={activePreset} onSelect={handlePreset} />

          <div className="ddp-cal">
            {/* Toolbar */}
            <div className="ddp-toolbar">
              <div className="ddp-toolbar-info" aria-live="polite">
                {pendingFrom
                  ? <>Từ: <strong>{fmtDisplay(pendingFrom)}</strong> → <span style={{ color: "var(--color-text-muted)" }}>chọn ngày kết thúc…</span></>
                  : from && to
                    ? <>Từ: <strong>{fromDisplay}</strong> → <strong>{toDisplay}</strong> · {rangeInfoText}</>
                    : <span style={{ color: "var(--color-text-muted)" }}>Chọn ngày bắt đầu</span>
                }
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div className="ddp-mode" role="group">
                  <button className={`ddp-mode-btn${mode === "solar" ? " ddp-mode-btn--on" : ""}`} onClick={() => setMode("solar")} aria-pressed={mode === "solar"}>☀ DL</button>
                  <button className={`ddp-mode-btn${mode === "lunar" ? " ddp-mode-btn--on ddp-mode-btn--son" : ""}`} onClick={() => setMode("lunar")} aria-pressed={mode === "lunar"}>🌙 ÂL</button>
                </div>
                <YMJumper year={vy} month={vm} onChange={(y, m) => { setVy(y); setVm(m); }} />
              </div>
            </div>

            {/* Two months */}
            <div className="ddp-months" onMouseLeave={() => setHoverDate(null)}>
              {/* Left month */}
              <div className="ddp-month">
                <div className="ddp-month-hd">
                  <button className="ddp-mnav" aria-label="Tháng trước" onClick={() => { const r = addMonths(vy, vm, -1); setVy(r.year); setVm(r.month); }}>‹</button>
                  <div className="ddp-mlbl">
                    Tháng {vm} năm {vy}
                    <span className="ddp-mlbl-lunar">{leftLunarLabel}</span>
                  </div>
                  <div style={{ width: 26 }} />
                </div>
                <div className="ddp-dows">
                  {["T2","T3","T4","T5","T6","T7","CN"].map((d, i) => (
                    <div key={d} className={`ddp-dow${i >= 5 ? " ddp-dow--we" : ""}`}>{d}</div>
                  ))}
                </div>
                <CalGrid
                  year={vy} month={vm}
                  rangeFrom={displayFrom} rangeTo={displayTo}
                  hoverDate={hoverDate}
                  today={today}
                  onSelect={handleSelect}
                  onHover={pendingFrom ? setHoverDate : undefined}
                />
              </div>

              {/* Right month */}
              <div className="ddp-month">
                <div className="ddp-month-hd">
                  <div style={{ width: 26 }} />
                  <div className="ddp-mlbl">
                    Tháng {rvm} năm {rvy}
                    <span className="ddp-mlbl-lunar">{rightLunarLabel}</span>
                  </div>
                  <button className="ddp-mnav" aria-label="Tháng sau" onClick={() => { const r = addMonths(vy, vm, 1); setVy(r.year); setVm(r.month); }}>›</button>
                </div>
                <div className="ddp-dows">
                  {["T2","T3","T4","T5","T6","T7","CN"].map((d, i) => (
                    <div key={d} className={`ddp-dow${i >= 5 ? " ddp-dow--we" : ""}`}>{d}</div>
                  ))}
                </div>
                <CalGrid
                  year={rvy} month={rvm}
                  rangeFrom={displayFrom} rangeTo={displayTo}
                  hoverDate={hoverDate}
                  today={today}
                  onSelect={handleSelect}
                  onHover={pendingFrom ? setHoverDate : undefined}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="ddp-foot">
              <div className="ddp-foot-info" aria-live="polite">
                {from && to ? (
                  <>
                    <div className="ddp-foot-date"><strong>{fromDisplay}</strong> ({fromLunar} ÂL) → <strong>{toDisplay}</strong> ({toLunar} ÂL)</div>
                    <div className="ddp-foot-lunar">{rangeInfoText}</div>
                  </>
                ) : pendingFrom ? (
                  <div className="ddp-foot-date">Từ: <strong>{fmtDisplay(pendingFrom)}</strong> — chọn ngày kết thúc</div>
                ) : (
                  <div className="ddp-foot-date" style={{ color: "var(--color-text-muted)" }}>Chưa chọn khoảng ngày</div>
                )}
              </div>
              <div className="ddp-foot-btns">
                {(from || to || pendingFrom) && optional && (
                  <button className="ddp-btn-ghost" onClick={() => { onChange?.(null); setActivePreset(undefined); setPendingFrom(null); setOpen(false); }}>Xóa</button>
                )}
                {pendingFrom && (
                  <button className="ddp-btn-ghost" onClick={() => { setPendingFrom(null); setHoverDate(null); }}>Bắt đầu lại</button>
                )}
                <button
                  className="ddp-btn-ok"
                  onClick={closePanel}
                  disabled={!from && !to && !pendingFrom}
                >Xong</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
