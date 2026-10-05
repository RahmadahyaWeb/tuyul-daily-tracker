"use server";

import { sql } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validations";
import { createSessionCookie, deleteSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function registerAction(prevState: unknown, formData: FormData) {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const { username, password } = parsed.data;

  try {
    // Check if username already exists (case-insensitive)
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(username) = LOWER(${username}) LIMIT 1;
    `;

    if (existing.length > 0) {
      return {
        success: false,
        error: "Username is already taken. Please choose another.",
      };
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create User
    await sql`
      INSERT INTO users (id, username, password, role, created_at, updated_at)
      VALUES (${userId}, ${username}, ${hashedPassword}, 'USER', NOW(), NOW());
    `;

    // 2. Automatically seed 7 default master activities for this new user
    const defaultActivities = [
      { id: crypto.randomUUID(), name: "Monster Hunt 600", code: "MH600", sortOrder: 0 },
      { id: crypto.randomUUID(), name: "Monster Hunt 3000", code: "MH3000", sortOrder: 1 },
      { id: crypto.randomUUID(), name: "Mission Board", code: "MISSION", sortOrder: 2 },
      { id: crypto.randomUUID(), name: "Guild Daily", code: "GUILD", sortOrder: 3 },
      { id: crypto.randomUUID(), name: "TC", code: "TC", sortOrder: 4 },
      { id: crypto.randomUUID(), name: "Arena", code: "ARENA", sortOrder: 5 },
      { id: crypto.randomUUID(), name: "Final Mirage", code: "FM", sortOrder: 6 },
    ];

    for (const act of defaultActivities) {
      await sql`
        INSERT INTO activities (id, user_id, name, code, sort_order, is_active, created_at, updated_at)
        VALUES (${act.id}, ${userId}, ${act.name}, ${act.code}, ${act.sortOrder}, TRUE, NOW(), NOW());
      `;
    }

    // 3. Automatically seed sample groups for this new user
    const defaultGroups = ["Personal", "Client A", "Farm Card"];
    for (const gName of defaultGroups) {
      await sql`
        INSERT INTO groups (id, user_id, name, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${userId}, ${gName}, NOW(), NOW());
      `;
    }

    // 4. Create Session Cookie & Login
    await createSessionCookie({
      id: userId,
      username,
      role: "USER",
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return {
      success: false,
      error: "Server error during registration. Please try again.",
    };
  }

  redirect("/onboarding");
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const { username, password } = parsed.data;

  try {
    const rows = await sql`
      SELECT id, username, password, role
      FROM users
      WHERE username = ${username}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    await createSessionCookie({
      id: user.id,
      username: user.username,
      role: user.role as "ADMIN" | "USER",
    });
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      error: "Server error during authentication",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSessionCookie();
  redirect("/login");
}

export async function updateAdminCredentialsAction(
  prevState: unknown,
  formData: FormData
) {
  const currentPassword = String(formData.get("currentPassword") || "");
  const newUsername = String(formData.get("newUsername") || "").trim();
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword) {
    return { success: false, error: "Current password is required" };
  }

  if (!newUsername || newUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters" };
  }

  if (newPassword && newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters" };
  }

  if (newPassword && newPassword !== confirmPassword) {
    return { success: false, error: "New password confirmation does not match" };
  }

  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    // Get current user from DB
    const rows = await sql`
      SELECT id, username, password, role FROM users WHERE id = ${session.id} LIMIT 1;
    `;

    if (rows.length === 0) {
      return { success: false, error: "User account not found" };
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: "Incorrect current password" };
    }

    // Check if newUsername is taken by another account
    if (newUsername !== user.username) {
      const existing = await sql`
        SELECT id FROM users WHERE username = ${newUsername} AND id != ${session.id} LIMIT 1;
      `;
      if (existing.length > 0) {
        return { success: false, error: "Username is already taken" };
      }
    }

    let finalHashedPassword = user.password;
    if (newPassword) {
      finalHashedPassword = await bcrypt.hash(newPassword, 10);
    }

    await sql`
      UPDATE users
      SET username = ${newUsername}, password = ${finalHashedPassword}, updated_at = NOW()
      WHERE id = ${session.id};
    `;

    // Refresh session cookie with new username
    await createSessionCookie({
      id: user.id,
      username: newUsername,
      role: user.role as "ADMIN" | "USER",
    });

    return { success: true, message: "Credentials updated successfully!" };
  } catch (err: any) {
    console.error("Update credentials error:", err);
    return { success: false, error: err.message || "Failed to update credentials" };
  }
}

