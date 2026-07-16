package vn.giapha.search.internal;

import java.text.Normalizer;
import java.util.Locale;

/** Chuẩn hóa tiếng Việt không dấu cho suggest / index. */
public final class VietnameseTextNormalizer {

    private VietnameseTextNormalizer() {}

    public static String fold(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String s = input.trim().toLowerCase(Locale.ROOT);
        s = s.replace('đ', 'd').replace('Đ', 'd');
        s = Normalizer.normalize(s, Normalizer.Form.NFD);
        s = s.replaceAll("\\p{M}+", "");
        s = s.replaceAll("\\s+", " ");
        return s.trim();
    }
}
