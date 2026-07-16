import { useEffect, useMemo, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Button,
  DualDatePicker,
  FormField,
  Input,
  Select,
  Textarea,
} from "@giapha/ui";
import { personSchema, type PersonSchemaInput } from "./personSchema";
import { getPerson, listPersons, nextTempCode, upsertPerson } from "./personStore";
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
    privacy: p?.privacy ?? "members",
    notes: p?.notes ?? "",
  };
}

export function PersonFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const existing = useMemo(() => (isNew ? undefined : getPerson(id)), [id, isNew]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonSchemaInput>({
    resolver: zodResolver(personSchema),
    defaultValues: toFormValues(existing),
  });

  useEffect(() => {
    reset(toFormValues(existing));
  }, [existing, reset]);

  const birthSolar = watch("birthSolar");

  const onSubmit = handleSubmit((values) => {
    const all = listPersons();
    const code = values.code?.trim() || (isNew ? nextTempCode(all) : existing!.code);
    const record: PersonRecord = {
      id: isNew ? `p-${crypto.randomUUID()}` : existing!.id,
      code,
      fullName: values.fullName.trim(),
      tenHuy: values.tenHuy?.trim() || undefined,
      gender: values.gender,
      lifeStatus: values.lifeStatus,
      generation: values.generation ? Number(values.generation) : undefined,
      birthSolar: values.birthSolar || undefined,
      privacy: values.privacy,
      notes: values.notes?.trim() || undefined,
    };
    upsertPerson(record);
    navigate("/persons");
  });

  if (!isNew && !existing) {
    return (
      <Alert title="Không tìm thấy hồ sơ" variant="error">
        <Link to="/persons">Quay lại danh sách</Link>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--spacing-md)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>
          {isNew ? "Thêm thành viên" : `Sửa — ${existing!.fullName}`}
        </h1>
        <Link to="/persons" style={{ fontFamily: "var(--font-body)" }}>
          ← Danh sách
        </Link>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        <div style={grid}>
          <FormField label="Mã hiệu" hint="Để trống sẽ tự sinh A… khi tạo mới" error={errors.code?.message}>
            <Input placeholder="A7" {...register("code")} />
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
              value={
                field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                  ? {
                      solar: {
                        year: Number(field.value.slice(0, 4)),
                        month: Number(field.value.slice(5, 7)),
                        day: Number(field.value.slice(8, 10)),
                      },
                    }
                  : undefined
              }
              onChange={(v) => {
                const iso = `${v.solar.year}-${String(v.solar.month).padStart(2, "0")}-${String(v.solar.day).padStart(2, "0")}`;
                field.onChange(iso);
                setValue("birthSolar", iso, { shouldValidate: true });
              }}
            />
          )}
        />
        {errors.birthSolar ? (
          <p style={{ color: "var(--color-status-error-fg)", fontFamily: "var(--font-body)" }}>
            {errors.birthSolar.message}
          </p>
        ) : null}
        {birthSolar ? (
          <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontSize: "var(--font-size-sm)" }}>
            Đã chọn dương lịch: {birthSolar}
          </p>
        ) : null}

        <FormField label="Ghi chú" error={errors.notes?.message}>
          <Textarea rows={4} {...register("notes")} />
        </FormField>

        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Button type="submit" disabled={isSubmitting}>
            Lưu
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/persons")}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
