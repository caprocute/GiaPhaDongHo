"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { z } from "zod";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Button,
  Dialog,
  EmptyState,
  FormField,
  HonorBoardCard,
  Input,
  Textarea,
} from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";
import styles from "./khuyen-hoc.module.css";

type Entry = {
  id?: number;
  personName?: string;
  achievement?: string;
  year?: number | null;
  status?: string | null;
};

const nominateSchema = z.object({
  personName: z.string().trim().min(2, "Nhập họ tên người được đề cử"),
  achievement: z.string().trim().min(4, "Mô tả thành tích rõ hơn"),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Năm gồm 4 chữ số")
    .refine((y) => {
      const n = Number(y);
      const now = new Date().getFullYear();
      return n >= 1950 && n <= now + 1;
    }, "Năm không hợp lệ"),
});

export function KhuyenHocClient() {
  const { user, getAccessToken, login, loading } = useAuth();
  const formId = useId().replace(/:/g, "");
  const [board, setBoard] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);
  const [personName, setPersonName] = useState("");
  const [achievement, setAchievement] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [fieldErrors, setFieldErrors] = useState<{
    personName?: string;
    achievement?: string;
    year?: string;
  }>({});
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!API_BASE) return;
    void fetch(`${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/scholarship-board`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setBoard(d as Entry[]))
      .catch(() => setBoard([]));
  }, []);

  function resetForm() {
    setPersonName("");
    setAchievement("");
    setYear(String(new Date().getFullYear()));
    setFieldErrors({});
    setErr(null);
  }

  function openNominate() {
    setMsg(null);
    setErr(null);
    setFieldErrors({});
    setOpen(true);
  }

  function closeNominate() {
    if (pending) return;
    setOpen(false);
  }

  async function nominate(e: FormEvent) {
    e.preventDefault();
    if (!API_BASE || !user) return;

    const parsed = nominateSchema.safeParse({ personName, achievement, year });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        personName: flat.personName?.[0],
        achievement: flat.achievement?.[0],
        year: flat.year?.[0],
      });
      return;
    }
    setFieldErrors({});
    setErr(null);
    setPending(true);

    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/scholarship-entries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            personName: parsed.data.personName,
            achievement: parsed.data.achievement,
            year: Number(parsed.data.year),
          }),
        },
      );
      if (!res.ok) {
        setErr((await res.text()).slice(0, 280));
        return;
      }
      resetForm();
      setOpen(false);
      setMsg("Đã gửi đề cử trang trọng — Ban trị sự sẽ xác minh trước khi công bố bảng vàng.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell
      label="F8 · Thành tích"
      title="Khuyến học"
      lead="Vinh danh con cháu đỗ đạt — đề cử → xác minh → khắc vào bảng vàng dịp giỗ tổ."
    >
      {msg ? (
        <Alert title="Đã nhận đề cử" variant="success">
          {msg}
        </Alert>
      ) : null}

      <section className={styles.intro} aria-labelledby="nominate-cta-heading">
        <div className={styles.introInner}>
          <div>
            <div className={styles.introEyebrow}>Nghi thức dòng họ</div>
            <h2 id="nominate-cta-heading" className={styles.introTitle}>
              Đề cử thành tích học tập
            </h2>
            <p className={styles.introLead}>
              Gửi đề cử trong hộp thoại trang trọng. Form không nằm trên trang — giữ bảng vàng trang nghiêm,
              chỉ mở khi con cháu muốn ghi danh.
            </p>
          </div>
          <Button type="button" onClick={openNominate} disabled={loading}>
            Mở tờ đề cử
          </Button>
        </div>
      </section>

      <section aria-labelledby="board-heading">
        <div className={styles.boardHead}>
          <h2 id="board-heading" className={styles.boardTitle}>
            Bảng vàng thành tích
          </h2>
          <span className={styles.boardHint}>Công bố sau khi duyệt</span>
        </div>
        {board.length === 0 ? (
          <EmptyState
            title="Chưa có thành tích công bố"
            description="Đề cử đã duyệt sẽ hiện tại đây như bảng vàng dòng họ."
          />
        ) : (
          <div className={styles.grid}>
            {board.map((b) => (
              <HonorBoardCard
                key={b.id}
                name={b.personName || "—"}
                detail={[b.achievement, b.year != null ? `Năm ${b.year}` : null]
                  .filter(Boolean)
                  .join(" · ")}
                emblem="學"
              />
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={open}
        variant="ceremonial"
        eyebrow="Tờ đề cử · Khuyến học"
        title="Đề cử thành tích"
        description="Họ tên và thành tích sẽ được Ban trị sự xác minh trước khi khắc vào bảng vàng."
        onClose={closeNominate}
        closeOnOverlay={!pending}
        footer={
          loading ? null : !user ? (
            <Button type="button" onClick={() => void login()}>
              Đăng nhập để đề cử
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={closeNominate} disabled={pending}>
                Để sau
              </Button>
              <Button type="submit" form={formId} disabled={pending}>
                {pending ? "Đang gửi…" : "Gửi đề cử"}
              </Button>
            </>
          )
        }
      >
        {loading ? (
          <p className={styles.formActionsHint}>Đang kiểm tra phiên đăng nhập…</p>
        ) : !user ? (
          <div className={styles.loginBox}>
            <p>Chỉ thành viên đã đăng nhập mới gửi được tờ đề cử — giữ tính xác thực của bảng vàng.</p>
          </div>
        ) : (
          <form id={formId} className={styles.form} onSubmit={(e) => void nominate(e)} noValidate>
            {err ? (
              <Alert title="Không gửi được" variant="error">
                {err}
              </Alert>
            ) : null}
            <p className={styles.formActionsHint}>
              Điền đủ thông tin. Sau khi gửi, đề cử ở trạng thái chờ duyệt.
            </p>
            <FormField label="Họ tên người được đề cử" htmlFor={`${formId}-name`} required error={fieldErrors.personName}>
              <Input
                id={`${formId}-name`}
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                disabled={pending}
                autoComplete="name"
                placeholder="Ví dụ: Hoàng Văn An"
              />
            </FormField>
            <FormField label="Thành tích" htmlFor={`${formId}-ach`} required error={fieldErrors.achievement}>
              <Textarea
                id={`${formId}-ach`}
                rows={3}
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                disabled={pending}
                placeholder="Đỗ đại học, giải thưởng, học hàm / học vị…"
              />
            </FormField>
            <FormField label="Năm" htmlFor={`${formId}-year`} required error={fieldErrors.year}>
              <Input
                id={`${formId}-year`}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={pending}
                inputMode="numeric"
                placeholder="2026"
              />
            </FormField>
          </form>
        )}
      </Dialog>
    </PageShell>
  );
}
