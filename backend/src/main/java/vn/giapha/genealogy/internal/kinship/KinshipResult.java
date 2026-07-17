package vn.giapha.genealogy.internal.kinship;

import java.util.List;

/** Kết quả máy tính xưng hô (F2). */
public record KinshipResult(
    String fromCode,
    String fromName,
    String toCode,
    String toName,
    String lcaCode,
    String relationLabel,
    String addressToThem,
    String addressFromThem,
    List<String> pathCodes
) {}
