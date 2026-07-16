import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Button,
  DualDatePicker,
  FormField,
  Input,
  Select,
  Textarea,
} from "@giapha/ui";
import {
  createTreePerson,
  defaultTreeSlug,
  getTreePerson,
  updateTreePerson,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { fromPersonDto, toPersonDto } from "./personMappers";
import { personSchema, type PersonSchemaInput } from "./personSchema";
import type { PersonRecord } from "./types";

function toFormValues(p?: PersonRecord): PersonSchemaInput {
  return {
    code: p?.code ?? "",
    fullName: p?.fullName ?? "",
    tenHuy: p?.tenHuy ?? "",
    gender: p?.gender ?? "M",
    lifeStatus: p?.lifeStatus ?? "alive",
    generation: p?.generation != null ? String(p.generation) : "",
    birthSolar: p?.birthSolar ?? "",
    deathSolar: p?.deathSolar ?? "",
    privacy: p?.privacy ?? "members",
    notes: p?.notes ?? "",
  };
}

function isoToDual(iso?: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  return {
    solar: {
      year: Number(iso.slice(0, 4)),
      month: Number(iso.slice(5, 7)),
      day: Number(iso.slice(8, 10)),
    },
  };
}

export function PersonFormPage() {
  const { id: codeParam } = useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const isNew = !codeParam || codeParam === "new";

  const [existing, setExisting] = useState<PersonRecord | undefined>();
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonSchemaInput>({
    resolver: zodResolver(personSchema),
    defaultValues: toFormValues(),
  });

  const lifeStatus = watch("lifeStatus");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isNew) {
        reset(toFormValues());
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const token = await getAccessToken();
        const dto = await getTreePerson(slug, codeParam!, token);
        const record = fromPersonDto(dto);
        if (!cancelled) {
          setExisting(record);
          reset(toFormValues(record));
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof ApiError ? e.message : "Không tải được hồ sơ.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [codeParam, getAccessToken, isNew, reset, slug]);

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    const record: PersonRecord = {
      id: isNew ? "" : existing!.id,
      code: values.code?.trim() || (isNew ? "" : existing!.code),
      fullName: values.fullName.trim(),
      tenHuy: values.tenHuy?.trim() || undefined,
      gender: values.gender,
      lifeStatus: values.lifeStatus,
      generation: values.generation ? Number(values.generation) : undefined,
      birthSolar: values.birthSolar || undefined,
      deathSolar: values.lifeStatus === "deceased" ? values.deathSolar || undefined : undefined,
      privacy: values.privacy,
      notes: values.notes?.trim() || undefined,
    };

    try {
      const token = await getAccessToken();
      const dto = toPersonDto(record);
      if (isNew) {
        const { id: _omit, ...body } = dto;
        await createTreePerson(slug, body, token);
      } else {
        await updateTreePerson(slug, existing!.code, { ...dto, id: Number(existing!.id) }, token);
      }
      navigate("/persons");
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Lưu hồ sơ thất bại.");
    }
  });

  if (loading) {
    return (
      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
    );
  }

  if (loadError || (!isNew && !existing)) {
    return (
      <Alert title="Không tìm thấy hồ sơ" variant="error">
        {loadError ?? "Hồ sơ không tồn tại."} <Link to="/persons">Quay lại danh sách</Link>
      </Alert>
    );
  }

  const grid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "var(--spacing-md)",
    maxWidth: 880,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "var(--spacing-md)",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>
          {isNew ? "Thêm thành viên" : `Sửa — ${existing!.fullName}`}
        </h1>
        <Link to="/persons" style={{ fontFamily: "var(--font-body)" }}>
          ← Danh sách
        </Link>
      </div>

      {saveError ? (
        <Alert title="Lỗi lưu" variant="error">
          {saveError}
        </Alert>
      ) : null}

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}
      >
        <div style={grid}>
          <FormField label="Mã hiệu" hint="Để trống sẽ tự sinh A…" error={errors.code?.message}>
            <Input placeholder="A7" disabled={!isNew} {...register("code")} />
          </FormField>
          <FormField label="Họ tên" required error={errors.fullName?.message}>
            <Input {...register("fullName")} />
          </FormField>
          <FormField label="Tên húy" error={errors.tenHuy?.message}>
            <Input {...register("tenHuy")} />
          </FormField>
          <FormField label="Giới tính" required error={errors.gender?.message}>
            <Select
              options={[
                { value: "M", label: "Nam" },
                { value: "F", label: "Nữ" },
                { value: "U", label: "Khác / không rõ" },
              ]}
              {...register("gender")}
            />
          </FormField>
          <FormField label="Trạng thái" required error={errors.lifeStatus?.message}>
            <Select
              options={[
                { value: "alive", label: "Còn sống" },
                { value: "deceased", label: "Đã mất" },
              ]}
              {...register("lifeStatus")}
            />
          </FormField>
          <FormField label="Đời" error={errors.generation?.message}>
            <Input type="number" min={1} {...register("generation")} />
          </FormField>
          <FormField label="Riêng tư" error={errors.privacy?.message}>
            <Select
              options={[
                { value: "public", label: "Công khai" },
                { value: "members", label: "Thành viên" },
                { value: "private", label: "Riêng tư" },
              ]}
              {...register("privacy")}
            />
          </FormField>
        </div>

        <Controller
          name="birthSolar"
          control={control}
          render={({ field }) => (
            <DualDatePicker
              label="Ngày sinh (dương / âm)"
              optional
              value={isoToDual(field.value)}
              onChange={(v) => {
                if (!v) {
                  field.onChange("");
                  return;
                }
                const iso = `${v.solar.year}-${String(v.solar.month).padStart(2, "0")}-${String(v.solar.day).padStart(2, "0")}`;
                field.onChange(iso);
              }}
            />
          )}
        />
        {errors.birthSolar ? (
          <p style={{ color: "var(--color-status-error-fg)", fontFamily: "var(--font-body)" }}>
            {errors.birthSolar.message}
          </p>
        ) : null}

        {lifeStatus === "deceased" ? (
          <>
            <Controller
              name="deathSolar"
              control={control}
              render={({ field }) => (
                <DualDatePicker
                  label="Ngày mất (dương / âm) — tạo ngày giỗ"
                  optional
                  value={isoToDual(field.value)}
                  onChange={(v) => {
                    if (!v) {
                      field.onChange("");
                      return;
                    }
                    const iso = `${v.solar.year}-${String(v.solar.month).padStart(2, "0")}-${String(v.solar.day).padStart(2, "0")}`;
                    field.onChange(iso);
                  }}
                />
              )}
            />
            {errors.deathSolar ? (
              <p style={{ color: "var(--color-status-error-fg)", fontFamily: "var(--font-body)" }}>
                {errors.deathSolar.message}
              </p>
            ) : null}
          </>
        ) : null}

        <FormField label="Ghi chú" error={errors.notes?.message}>
          <Textarea rows={4} {...register("notes")} />
        </FormField>

        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu…" : "Lưu"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/persons")}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
