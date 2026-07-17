import { useState } from "react";
import { Alert, Button, FormField, Input } from "@giapha/ui";
import { defaultTreeSlug, setStoredTreeSlug } from "../api/genealogyApi";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { adminSiteTitle } from "../lib/siteTitle";

export function SettingsPage() {
  const [treeSlug, setTreeSlug] = useState(() => defaultTreeSlug());
  const [siteTitle, setSiteTitle] = useState(() => adminSiteTitle());
  const [saved, setSaved] = useState(false);

  function onSave() {
    const slug = treeSlug.trim() || "ho-hoang";
    setStoredTreeSlug(slug);
    setTreeSlug(slug);
    localStorage.setItem("giapha.admin.siteTitle", siteTitle.trim() || "Họ Hoàng Trung Bính");
    setSaved(true);
  }

  return (
    <div className="admin-stack" style={{ maxWidth: 520 }}>
      <AdminPageHeader
        title="Cài đặt"
        description="Tùy chỉnh tên hiển thị và cây phả hệ mặc định trên trình duyệt này."
      />

      {saved ? (
        <Alert title="Đã lưu" variant="success">
          Cài đặt đã được lưu trên trình duyệt. Tải lại trang để cập nhật tiêu đề trên thanh điều hướng.
        </Alert>
      ) : null}

      <FormField label="Tên dòng họ hiển thị" hint="Dùng trên thanh điều hướng quản trị">
        <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
      </FormField>
      <FormField
        label="Mã cây phả hệ mặc định"
        hint="Liên kết tới cây phả hệ trên hệ thống. Có thể ghi đè bằng biến môi trường VITE_DEFAULT_TREE_SLUG."
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
