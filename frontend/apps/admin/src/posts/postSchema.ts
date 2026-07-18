import { z } from "zod";

export const postSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), "Đường dẫn chỉ gồm chữ thường, số và gạch ngang"),
    title: z.string().trim().min(1, "Tiêu đề bắt buộc"),
    summary: z.string().optional().or(z.literal("")),
    bodyHtml: z.string().trim().min(1, "Nội dung bắt buộc"),
    status: z.enum(["draft", "published", "archived"]),
    categorySlug: z.string().optional().or(z.literal("")),
    authorName: z.string().optional().or(z.literal("")),
    coverObjectKey: z.string().optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (val.status === "published" && !val.categorySlug?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Chọn chuyên mục trước khi xuất bản lên cổng thông tin",
        path: ["categorySlug"],
      });
    }
  });

export type PostSchemaInput = z.infer<typeof postSchema>;
