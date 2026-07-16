package vn.giapha.core.lunar;

/**
 * Thuật toán lịch âm Việt Nam — Hồ Ngọc Đức (UTC+7).
 * Đồng bộ với {@code frontend/packages/lunar} và golden vectors
 * {@code frontend/shared/lunar-vectors/golden.json}.
 */
public final class LunarCalendar {

    private static final double PI = Math.PI;
    private static final String[] CAN = {
        "Giáp",
        "Ất",
        "Bính",
        "Đinh",
        "Mậu",
        "Kỷ",
        "Canh",
        "Tân",
        "Nhâm",
        "Quý",
    };
    private static final String[] CHI = {
        "Tý",
        "Sửu",
        "Dần",
        "Mão",
        "Thìn",
        "Tỵ",
        "Ngọ",
        "Mùi",
        "Thân",
        "Dậu",
        "Tuất",
        "Hợi",
    };

    private LunarCalendar() {}

    private static int INT(double d) {
        return (int) Math.floor(d);
    }

    static int jdFromDate(int dd, int mm, int yy) {
        int a = INT((14 - mm) / 12.0);
        int y = yy + 4800 - a;
        int m = mm + 12 * a - 3;
        int jd = dd + INT((153 * m + 2) / 5.0) + 365 * y + INT(y / 4.0) - INT(y / 100.0) + INT(y / 400.0) - 32045;
        if (jd < 2299161) {
            jd = dd + INT((153 * m + 2) / 5.0) + 365 * y + INT(y / 4.0) - 32083;
        }
        return jd;
    }

    static SolarDate jdToDate(int jd) {
        int a;
        int b;
        int c;
        if (jd > 2299160) {
            a = jd + 32044;
            b = INT((4 * a + 3) / 146097.0);
            a = a - INT((146097 * b) / 4.0);
        } else {
            b = 0;
            a = jd + 32082;
        }
        c = INT((4 * a + 3) / 1461.0);
        a = a - INT((1461 * c) / 4.0);
        int d = INT((5 * a + 2) / 153.0);
        int day = a - INT((153 * d + 2) / 5.0) + 1;
        int month = d + 3 - 12 * INT(d / 10.0);
        int year = b * 100 + c - 4800 + INT(d / 10.0);
        return new SolarDate(day, month, year);
    }

    static int getNewMoonDay(int k, double timeZone) {
        double T = k / 1236.85;
        double T2 = T * T;
        double T3 = T2 * T;
        double dr = PI / 180;
        double Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
        Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
        double M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
        double Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
        double F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
        double C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
        C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
        C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
        C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
        C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
        C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
        C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
        double deltat = T < -11
            ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
            : -0.000278 + 0.000265 * T + 0.000262 * T2;
        double JdNew = Jd1 + C1 - deltat;
        return INT(JdNew + 0.5 + timeZone / 24);
    }

    static int getSunLongitude(int jdn, double timeZone) {
        double T = (jdn - 2451545.5 - timeZone / 24) / 36525;
        double T2 = T * T;
        double dr = PI / 180;
        double M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
        double L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
        double DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
        DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
        double L = L0 + DL;
        L = L * dr;
        L = L - PI * 2 * INT(L / (PI * 2));
        return INT((L / PI) * 6);
    }

    static int getLunarMonth11(int yy, double timeZone) {
        int off = jdFromDate(31, 12, yy) - 2415021;
        int k = INT(off / 29.530588853);
        int nm = getNewMoonDay(k, timeZone);
        int sunLong = getSunLongitude(nm, timeZone);
        if (sunLong >= 9) {
            nm = getNewMoonDay(k - 1, timeZone);
        }
        return nm;
    }

    static int getLeapMonthOffset(int a11, double timeZone) {
        int k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
        int last;
        int i = 1;
        int arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
        do {
            last = arc;
            i += 1;
            arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
        } while (arc != last && i < 14);
        return i - 1;
    }

    public static LunarDate convertSolarToLunar(int dd, int mm, int yy) {
        return convertSolarToLunar(dd, mm, yy, 7);
    }

    public static LunarDate convertSolarToLunar(int dd, int mm, int yy, double timeZone) {
        int dayNumber = jdFromDate(dd, mm, yy);
        int k = INT((dayNumber - 2415021.076998695) / 29.530588853);
        int monthStart = getNewMoonDay(k + 1, timeZone);
        if (monthStart > dayNumber) {
            monthStart = getNewMoonDay(k, timeZone);
        }
        int a11 = getLunarMonth11(yy, timeZone);
        int b11 = a11;
        int lunarYear;
        if (a11 >= monthStart) {
            lunarYear = yy;
            a11 = getLunarMonth11(yy - 1, timeZone);
        } else {
            lunarYear = yy + 1;
            b11 = getLunarMonth11(yy + 1, timeZone);
        }
        int lunarDay = dayNumber - monthStart + 1;
        int diff = INT((monthStart - a11) / 29.0);
        boolean lunarLeap = false;
        int lunarMonth = diff + 11;
        if (b11 - a11 > 365) {
            int leapMonthDiff = getLeapMonthOffset(a11, timeZone);
            if (diff >= leapMonthDiff) {
                lunarMonth = diff + 10;
                if (diff == leapMonthDiff) {
                    lunarLeap = true;
                }
            }
        }
        if (lunarMonth > 12) {
            lunarMonth = lunarMonth - 12;
        }
        if (lunarMonth >= 11 && diff < 4) {
            lunarYear -= 1;
        }
        return new LunarDate(lunarDay, lunarMonth, lunarYear, lunarLeap);
    }

    public static SolarDate convertLunarToSolar(int lunarDay, int lunarMonth, int lunarYear, boolean lunarLeap) {
        return convertLunarToSolar(lunarDay, lunarMonth, lunarYear, lunarLeap, 7);
    }

    public static SolarDate convertLunarToSolar(
        int lunarDay,
        int lunarMonth,
        int lunarYear,
        boolean lunarLeap,
        double timeZone
    ) {
        int a11;
        int b11;
        if (lunarMonth < 11) {
            a11 = getLunarMonth11(lunarYear - 1, timeZone);
            b11 = getLunarMonth11(lunarYear, timeZone);
        } else {
            a11 = getLunarMonth11(lunarYear, timeZone);
            b11 = getLunarMonth11(lunarYear + 1, timeZone);
        }
        int off = lunarMonth - 11;
        if (off < 0) {
            off += 12;
        }
        if (b11 - a11 > 365) {
            int leapOff = getLeapMonthOffset(a11, timeZone);
            int leapMonth = leapOff - 2;
            if (leapMonth < 0) {
                leapMonth += 12;
            }
            if (lunarLeap && lunarMonth != leapMonth) {
                return new SolarDate(Integer.MIN_VALUE, Integer.MIN_VALUE, Integer.MIN_VALUE);
            }
            if (lunarLeap || off >= leapOff) {
                off += 1;
            }
        }
        int k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
        int monthStart = getNewMoonDay(k + off, timeZone);
        return jdToDate(monthStart + lunarDay - 1);
    }

    public static CanChi getCanChiDay(int dd, int mm, int yy) {
        int jd = jdFromDate(dd, mm, yy);
        return getCanChiFromIndex((jd + 9) % 10, (jd + 1) % 12);
    }

    public static CanChi getCanChiMonth(int lunarMonth, int lunarYear) {
        int yearCan = (lunarYear + 6) % 10;
        int monthCan = (yearCan * 2 + lunarMonth + 3) % 10;
        int monthChi = (lunarMonth + 1) % 12;
        return getCanChiFromIndex(monthCan, monthChi);
    }

    public static CanChi getCanChiYear(int lunarYear) {
        return getCanChiFromIndex((lunarYear + 6) % 10, (lunarYear + 8) % 12);
    }

    public static CanChi getCanChi(int dd, int mm, int yy, String part) {
        if ("year".equals(part)) {
            LunarDate lunar = convertSolarToLunar(dd, mm, yy);
            return getCanChiYear(lunar.year());
        }
        if ("month".equals(part)) {
            LunarDate lunar = convertSolarToLunar(dd, mm, yy);
            return getCanChiMonth(lunar.month(), lunar.year());
        }
        return getCanChiDay(dd, mm, yy);
    }

    private static CanChi getCanChiFromIndex(int canIndex, int chiIndex) {
        String can = CAN[Math.floorMod(canIndex, 10)];
        String chi = CHI[Math.floorMod(chiIndex, 12)];
        return new CanChi(can, chi, can + " " + chi);
    }
}
