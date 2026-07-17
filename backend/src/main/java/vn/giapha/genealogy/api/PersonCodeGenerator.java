package vn.giapha.genealogy.api;

import java.util.Collection;
import java.util.Locale;
import java.util.OptionalInt;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Sinh mã hiệu kiểu NukeViet / glossary: {@code A1}, {@code A7}, {@code A7-sp1}.
 * Prefix cấu hình được theo cây (mặc định {@code A}).
 */
public final class PersonCodeGenerator {

    private static final Pattern SPOUSE = Pattern.compile("^(.+)-sp(\\d+)$", Pattern.CASE_INSENSITIVE);

    private PersonCodeGenerator() {}

    public static String nextLineageCode(Collection<String> existingCodes) {
        return nextLineageCode(existingCodes, "A");
    }

    /** Mã dòng chính tiếp theo trong cây ({@code A1}, {@code B1}, …). */
    public static String nextLineageCode(Collection<String> existingCodes, String prefix) {
        String p = normalizePrefix(prefix);
        Pattern lineage = Pattern.compile("^" + Pattern.quote(p) + "(\\d+)$", Pattern.CASE_INSENSITIVE);
        int max = existingCodes
            .stream()
            .map(code -> lineageNumber(code, lineage))
            .flatMapToInt(OptionalInt::stream)
            .max()
            .orElse(0);
        return p + (max + 1);
    }

    /** Mã phối ngẫu: {@code A7-sp1}, {@code A7-sp2}, … */
    public static String nextSpouseCode(String personCode, Collection<String> existingCodes) {
        if (personCode == null || personCode.isBlank()) {
            throw new IllegalArgumentException("personCode bắt buộc để sinh mã phối ngẫu");
        }
        String base = personCode.trim();
        String pref = base.toLowerCase(Locale.ROOT) + "-sp";
        int max = 0;
        for (String code : existingCodes) {
            if (code == null) {
                continue;
            }
            Matcher m = SPOUSE.matcher(code.trim());
            if (m.matches() && m.group(1).equalsIgnoreCase(base)) {
                max = Math.max(max, Integer.parseInt(m.group(2)));
            } else if (code.toLowerCase(Locale.ROOT).startsWith(pref)) {
                // fallback ignored
            }
        }
        return base + "-sp" + (max + 1);
    }

    public static String appendLineagePath(String parentPathOrCode, String newCode) {
        if (newCode == null || newCode.isBlank()) {
            throw new IllegalArgumentException("newCode bắt buộc");
        }
        if (parentPathOrCode == null || parentPathOrCode.isBlank()) {
            return newCode;
        }
        return parentPathOrCode + "." + newCode;
    }

    public static String normalizePrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return "A";
        }
        String p = prefix.trim().toUpperCase(Locale.ROOT);
        if (!p.matches("[A-Z]{1,4}")) {
            return "A";
        }
        return p;
    }

    private static OptionalInt lineageNumber(String code, Pattern lineage) {
        if (code == null) {
            return OptionalInt.empty();
        }
        Matcher m = lineage.matcher(code.trim());
        if (!m.matches()) {
            return OptionalInt.empty();
        }
        return OptionalInt.of(Integer.parseInt(m.group(1)));
    }
}
