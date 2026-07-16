package vn.giapha.genealogy.api;

import java.util.Collection;
import java.util.Locale;
import java.util.OptionalInt;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Sinh mã hiệu kiểu NukeViet / glossary: {@code A1}, {@code A7}, {@code A7-sp1}.
 */
public final class PersonCodeGenerator {

    private static final Pattern LINEAGE = Pattern.compile("^A(\\d+)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern SPOUSE = Pattern.compile("^(.+)-sp(\\d+)$", Pattern.CASE_INSENSITIVE);

    private PersonCodeGenerator() {}

    /** Mã dòng chính tiếp theo trong cây (A1, A2, …). */
    public static String nextLineageCode(Collection<String> existingCodes) {
        int max = existingCodes
            .stream()
            .map(PersonCodeGenerator::lineageNumber)
            .flatMapToInt(OptionalInt::stream)
            .max()
            .orElse(0);
        return "A" + (max + 1);
    }

    /** Mã phối ngẫu: {@code A7-sp1}, {@code A7-sp2}, … */
    public static String nextSpouseCode(String personCode, Collection<String> existingCodes) {
        if (personCode == null || personCode.isBlank()) {
            throw new IllegalArgumentException("personCode bắt buộc để sinh mã phối ngẫu");
        }
        String base = personCode.trim();
        String prefix = base.toLowerCase(Locale.ROOT) + "-sp";
        int max = 0;
        for (String code : existingCodes) {
            if (code == null) {
                continue;
            }
            Matcher m = SPOUSE.matcher(code.trim());
            if (m.matches() && m.group(1).equalsIgnoreCase(base)) {
                max = Math.max(max, Integer.parseInt(m.group(2)));
            } else if (code.toLowerCase(Locale.ROOT).startsWith(prefix)) {
                // fallback
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

    private static OptionalInt lineageNumber(String code) {
        if (code == null) {
            return OptionalInt.empty();
        }
        Matcher m = LINEAGE.matcher(code.trim());
        if (!m.matches()) {
            return OptionalInt.empty();
        }
        return OptionalInt.of(Integer.parseInt(m.group(1)));
    }
}
