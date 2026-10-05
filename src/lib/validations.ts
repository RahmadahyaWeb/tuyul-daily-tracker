import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Nama group wajib diisi").max(50, "Maksimal 50 karakter"),
});

export const activitySchema = z.object({
  name: z.string().trim().min(1, "Nama activity wajib diisi").max(50, "Maksimal 50 karakter"),
  code: z
    .string()
    .trim()
    .min(1, "Kode activity wajib diisi")
    .max(20, "Maksimal 20 karakter")
    .toUpperCase(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const accountSchema = z.object({
  nickname: z.string().trim().min(1, "Nickname wajib diisi"),
  username: z.string().trim().min(1, "Username login wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  server: z.string().trim().min(1, "Server wajib diisi"),
  owner: z.string().trim().min(1, "Owner wajib diisi"),
  job: z.string().trim().min(1, "Job / Class wajib diisi"),
  level: z.coerce.number().int().min(1).max(999).default(1),
  startDate: z.string().min(1, "Start date wajib diisi"),
  status: z.enum(["Active", "Paused", "Finished"]).default("Active"),
  notes: z.string().optional().nullable(),
  groupId: z.string().optional().nullable(),
  activityIds: z.array(z.string()).min(1, "Pilih minimal 1 aktivitas untuk akun ini"),
});

export const accountUpdateSchema = accountSchema.partial().extend({
  id: z.string().min(1),
  // Password is optional during edit: if empty, keeps existing password
  password: z.string().optional(),
});
