package vn.giapha.genealogy.api;

/** Ngữ cảnh người xem khi áp privacy filter. */
public record ViewerContext(ViewerRole role) {
    public static ViewerContext guest() {
        return new ViewerContext(ViewerRole.GUEST);
    }

    public static ViewerContext member() {
        return new ViewerContext(ViewerRole.MEMBER);
    }

    public static ViewerContext editor() {
        return new ViewerContext(ViewerRole.EDITOR);
    }
}
