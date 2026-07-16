import { describe, expect, it } from "vitest";
import golden from "../../../../shared/lunar-vectors/golden.json";
import {
  convertLunarToSolar,
  convertSolarToLunar,
  getCanChi,
  getCanChiYear,
} from "../index";

describe("@giapha/lunar golden vectors", () => {
  for (const vector of golden) {
    it(`solar → lunar: ${vector.label}`, () => {
      const { day, month, year } = vector.solar;
      const lunar = convertSolarToLunar(day, month, year);
      expect(lunar.day).toBe(vector.lunar.day);
      expect(lunar.month).toBe(vector.lunar.month);
      expect(lunar.year).toBe(vector.lunar.year);
      expect(lunar.leap).toBe(vector.lunar.leap);
      if ("canChiYear" in vector && typeof vector.canChiYear === "string") {
        expect(getCanChiYear(lunar.year).label).toBe(vector.canChiYear);
      }
    });

    it(`lunar → solar round-trip: ${vector.label}`, () => {
      const { day, month, year, leap } = vector.lunar;
      const solar = convertLunarToSolar(day, month, year, leap);
      expect(solar.day).toBe(vector.solar.day);
      expect(solar.month).toBe(vector.solar.month);
      expect(solar.year).toBe(vector.solar.year);
    });
  }

  it("can chi năm Tết Giáp Thìn", () => {
    const cc = getCanChiYear(2024);
    expect(cc.label).toBe("Giáp Thìn");
    expect(getCanChi(10, 2, 2024, "year").label).toBe("Giáp Thìn");
  });
});
