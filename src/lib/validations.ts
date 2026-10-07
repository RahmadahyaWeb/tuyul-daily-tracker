import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username maximum 30 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(50, "Maximum 50 characters"),
});

export const activitySchema = z.object({
  name: z.string().trim().min(1, "Activity name is required").max(50, "Maximum 50 characters"),
  code: z
    .string()
    .trim()
    .min(1, "Activity code is required")
    .max(20, "Maximum 20 characters")
    .toUpperCase(),
  activityType: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const accountSchema = z.object({
  nickname: z.string().trim().min(1, "Nickname is required"),
  username: z.string().trim().min(1, "Login username is required"),
  password: z.string().optional().nullable(),
  server: z.string().trim().min(1, "Server is required"),
  job: z.string().trim().min(1, "Job / Class is required"),
  level: z.coerce.number().int().min(1).max(999).default(1),
  startDate: z.string().min(1, "Start date is required"),
  status: z.enum(["Active", "Paused", "Finished"]).default("Active"),
  notes: z.string().optional().nullable(),
  groupId: z.string().optional().nullable(),
  zeny: z.coerce.number().min(0).default(0),
  activityIds: z.array(z.string()).min(1, "Select at least 1 assigned activity"),
});

export const accountUpdateSchema = accountSchema.partial().extend({
  id: z.string().min(1),
});
