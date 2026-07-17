package vn.giapha.genealogy.internal.kinship;

/**
 * Bảng luật xưng hô rút gọn theo chênh đời + giới tính (F2).
 * Không phủ hết phương ngữ — đủ dùng cho phả hệ nội.
 */
public final class VietnameseHonorifics {

    private VietnameseHonorifics() {}

    /**
     * @param genDiff generations of {@code to} relative to {@code from} (positive = to is younger/descendant)
     * @param toGender M/F/other
     */
    public static String addressFromTo(int genDiff, String toGender, boolean sameLine) {
        boolean female = isFemale(toGender);
        if (genDiff == 0) {
            return female ? "chị/em" : "anh/em";
        }
        if (genDiff == 1) {
            return female ? "cháu" : "cháu";
        }
        if (genDiff == -1) {
            if (sameLine) {
                return female ? "bác/cô" : "bác/chú";
            }
            return female ? "bác" : "bác";
        }
        if (genDiff >= 2) {
            return "cháu";
        }
        if (genDiff <= -2) {
            return female ? "cụ/bà" : "cụ/ông";
        }
        return "họ hàng";
    }

    public static String relationLabel(int genDiff, String toGender) {
        boolean female = isFemale(toGender);
        if (genDiff == 0) {
            return female ? "cùng đời (chị/em)" : "cùng đời (anh/em)";
        }
        if (genDiff == 1) {
            return female ? "con/cháu gái (1 đời)" : "con/cháu trai (1 đời)";
        }
        if (genDiff == -1) {
            return female ? "cô/bác (1 đời trên)" : "chú/bác (1 đời trên)";
        }
        if (genDiff > 1) {
            return "hậu duệ (" + genDiff + " đời)";
        }
        return "tổ tiên (" + (-genDiff) + " đời)";
    }

    private static boolean isFemale(String gender) {
        if (gender == null) {
            return false;
        }
        String g = gender.trim().toLowerCase();
        return g.startsWith("f") || g.equals("nữ") || g.equals("nu") || g.equals("female");
    }
}
