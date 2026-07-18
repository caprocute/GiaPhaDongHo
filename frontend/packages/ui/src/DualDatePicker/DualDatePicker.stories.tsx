import { useState } from "react";
import { DualDatePicker, DualDateRangePicker } from "./DualDatePicker";
import type { DualDateValue, DualDateRangeValue } from "./DualDatePicker";

export default { title: "DualDatePicker" };

export const SingleSolar = () => {
  const [val, setVal] = useState<DualDateValue | null>(null);
  return (
    <div style={{ padding: 24 }}>
      <DualDatePicker label="Ngày sinh" optional value={val} onChange={setVal} />
      <pre style={{ marginTop: 16, fontSize: 11 }}>{JSON.stringify(val, null, 2)}</pre>
    </div>
  );
};

export const SingleWithValue = () => {
  const [val, setVal] = useState<DualDateValue | null>({
    solar: { day: 18, month: 7, year: 2026 },
    lunarLabel: "24 tháng 5 năm Bính Ngọ ÂL",
  });
  return (
    <div style={{ padding: 24 }}>
      <DualDatePicker label="Ngày mất" optional value={val} onChange={setVal} />
    </div>
  );
};

export const RangePicker = () => {
  const [val, setVal] = useState<DualDateRangeValue | null>(null);
  return (
    <div style={{ padding: 24 }}>
      <p style={{ fontSize: 13, marginBottom: 12 }}>Khoảng thời gian đóng góp</p>
      <DualDateRangePicker optional value={val} onChange={setVal} />
      <pre style={{ marginTop: 16, fontSize: 11 }}>{JSON.stringify(val, null, 2)}</pre>
    </div>
  );
};

export const Disabled = () => (
  <div style={{ padding: 24 }}>
    <DualDatePicker label="Ngày sinh" disabled value={{ solar: { day: 1, month: 1, year: 1990 } }} />
  </div>
);
