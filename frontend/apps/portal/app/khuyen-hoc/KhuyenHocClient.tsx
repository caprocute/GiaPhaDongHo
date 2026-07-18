"use client";

import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
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
  level?: string | null;
  personCode?: string | null;
  schoolOrField?: string | null;
  medalNote?: string | null;
};

const LEVELS = [
  { value: "", label: "Chọn trình độ" },
  { value: "phd", label: "Tiến sĩ" },
  { value: "master", label: "Thạc sĩ" },
  { value: "university", label: "Đại học" },
  { value: "highschool", label: "THPT" },
] as const;

const levelLabel: Record<string, string> = {
  phd: "Tiến sĩ",
  master: "Thạc sĩ",
  university: "Đại học",
  highschool: "THPT",
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
  personCode: z.string().trim().max(32).optional().or(z.literal("")),
  level: z.enum(["phd", "master", "university", "highschool"], {
    message: "Chọn trình độ",
  }),
  schoolOrField: z.string().trim().max(200).optional().or(z.literal("")),
  medalNote: z.string().trim().max(300).optional().or(z.literal("")),
});

export function KhuyenHocClient() {
  const { user, getAccessToken, login, loading } = useAuth();
  const formId = useId().replace(/:/g, "");
  const [board, setBoard] = useState<Entry[]>([]);
  const [filterLevel, setFilterLevel] = useState("");
  const [open, setOpen] = useState(false);
  const [personName, setPersonName] = useState("");
  const [achievement, setAchievement] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [personCode, setPersonCode] = useState("");
  const [level, setLevel] = useState("");
  const [schoolOrField, setSchoolOrField] = useState("");
  const [medalNote, setMedalNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    personName?: string;
    achievement?: string;
    year?: string;
    personCode?: string;
    level?: string;
    schoolOrField?: string;
    medalNote?: string;
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

  const visibleBoard = useMemo(() => {
    if (!filterLevel) return board;
    return board.filter((b) => (b.level ?? "") === filterLevel);
  }, [board, filterLevel]);

  function resetForm() {
    setPersonName("");
    setAchievement("");
    setYear(String(new Date().getFullYear()));
    setPersonCode("");
    setLevel("");
    setSchoolOrField("");
    setMedalNote("");
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

    const parsed = nominateSchema.safeParse({
      personName,
      achievement,
      year,
      personCode,
      level,
      schoolOrField,
      medalNote,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        personName: flat.personName?.[0],
        achievement: flat.achievement?.[0],
        year: flat.year?.[0],
        personCode: flat.personCode?.[0],
        level: flat.level?.[0],
        schoolOrField: flat.schoolOrField?.[0],
        medalNote: flat.medalNote?.[0],
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
            personCode: parsed.data.personCode || undefined,
            level: parsed.data.level || undefined,
            schoolOrField: parsed.data.schoolOrField || undefined,
            medalNote: parsed.data.medalNote || undefined,
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
      label="Thành tích"
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
          <div className={styles.boardTools}>
            <label className={styles.filterLabel}>
              <span className="sr-only">Lọc trình độ</span>
              <select
                className={styles.filterSelect}
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="">Tất cả trình độ</option>
                {LEVELS.filter((l) => l.value).map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <span className={styles.boardHint}>Công bố sau khi duyệt</span>
          </div>
        </div>
        {visibleBoard.length === 0 ? (
          <EmptyState
            title="Chưa có thành tích công bố"
            description="Đề cử đã duyệt sẽ hiện tại đây như bảng vàng dòng họ."
          />
        ) : (
          <div className={styles.grid}>
            {visibleBoard.map((b) => (
              <HonorBoardCard
                key={b.id}
                name={b.personName || "—"}
                detail={[
                  b.achievement,
                  b.level ? levelLabel[b.level] ?? b.level : null,
                  b.schoolOrField,
                  b.year != null ? `Năm ${b.year}` : null,
                  b.medalNote,
                ]
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
              Điền đủ thông tin. Nếu biết mã người trong phả, ghi để Ban trị sự đối chiếu hồ sơ nhanh hơn.
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
            <FormField label="Mã trong phả (tuỳ chọn)" htmlFor={`${formId}-code`} error={fieldErrors.personCode}>
              <Input
                id={`${formId}-code`}
                value={personCode}
                onChange={(e) => setPersonCode(e.target.value)}
                disabled={pending}
                placeholder="Ví dụ: A6a"
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
            <div className={styles.formRow}>
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
              <FormField label="Trình độ" htmlFor={`${formId}-level`} required error={fieldErrors.level}>
                <select
                  id={`${formId}-level`}
                  className={styles.filterSelect}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={pending}
                  required
                >
                  {LEVELS.map((l) => (
                    <option key={l.value || "none"} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Trường / ngành" htmlFor={`${formId}-school`} error={fieldErrors.schoolOrField}>
              <Input
                id={`${formId}-school`}
                value={schoolOrField}
                onChange={(e) => setSchoolOrField(e.target.value)}
                disabled={pending}
                placeholder="Ví dụ: Công nghệ thông tin — ĐH Bách khoa"
              />
            </FormField>
            <FormField label="Giải thưởng / huy chương (tuỳ chọn)" htmlFor={`${formId}-medal`} error={fieldErrors.medalNote}>
              <Input
                id={`${formId}-medal`}
                value={medalNote}
                onChange={(e) => setMedalNote(e.target.value)}
                disabled={pending}
                placeholder="Ví dụ: Giải Ba HSG tỉnh môn Vật lý"
              />
            </FormField>
          </form>
        )}
      </Dialog>
    </PageShell>
  );
}
