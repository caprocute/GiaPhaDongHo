import { useState } from "react";
import { Alert, Button, FormField, Input } from "@giapha/ui";
import { defaultTreeSlug, setStoredTreeSlug } from "../api/genealogyApi";

export function SettingsPage() {
  const [treeSlug, setTreeSlug] = useState(() => defaultTreeSlug());
  const [siteTitle, setSiteTitle] = useState(() => {
    try {
      return localStorage.getItem("giapha.admin.siteTitle") ?? "GiaPhaHub";
    } catch {
      return "GiaPhaHub";
    }
  });
  const [saved, setSaved] = useState(false);

  function onSave() {
    const slug = treeSlug.trim() || "ho-hoang";
    setStoredTreeSlug(slug);
    setTreeSlug(slug);
    localStorage.setItem("giapha.admin.siteTitle", siteTitle.trim() || "GiaPhaHub");
    setSaved(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 520 }}>
      <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Cài đặt site</h1>
      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", margin: 0 }}>
        Lưu local trên trình duyệt admin (R1.8 cơ bản). API cấu hình site toàn cục sẽ bổ sung sau.
      </p>

      {saved ? (
        <Alert title="Đã lưu" variant="success">
          Tree slug dùng cho Tree editor / CRM.
        </Alert>
      ) : null}

      <FormField label="Tên hiển thị site" hint="Chỉ lưu local admin">
        <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
      </FormField>
      <FormField
        label="Slug cây mặc định"
        hint="Khớp FamilyTree.slug (vd. ho-hoang). Có thể ghi đè bằng VITE_DEFAULT_TREE_SLUG."
        required
      >
        <Input value={treeSlug} onChange={(e) => setTreeSlug(e.target.value)} />
      </FormField>
      <Button type="button" onClick={onSave}>
        Lưu
      </Button>
    </div>
  );
}
