import { z } from "zod";

const isoDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Ngày dương không hợp lệ");

export const personSchema = z
  .object({
    code: z.string().trim().max(32).optional().or(z.literal("")),
    fullName: z.string().trim().min(1, "Họ tên bắt buộc"),
    tenHuy: z.string().trim().optional().or(z.literal("")),
    gender: z.enum(["M", "F", "U"]),
    lifeStatus: z.enum(["alive", "deceased"]),
    generation: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || (/^\d+$/.test(v) && Number(v) >= 1), "Đời phải là số ≥ 1"),
    birthSolar: isoDate,
    deathSolar: isoDate,
    privacy: z.enum(["public", "members", "private"]),
    notes: z.string().optional().or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    if (v.lifeStatus === "deceased" && !v.deathSolar?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["deathSolar"],
        message: "Người đã mất cần ngày mất (để tạo ngày giỗ)",
      });
    }
  });

export type PersonSchemaInput = z.infer<typeof personSchema>;
