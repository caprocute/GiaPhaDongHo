import { z } from "zod";

export const personSchema = z.object({
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
  birthSolar: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Ngày dương không hợp lệ"),
  privacy: z.enum(["public", "members", "private"]),
  notes: z.string().optional().or(z.literal("")),
});

export type PersonSchemaInput = z.infer<typeof personSchema>;
