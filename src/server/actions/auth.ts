"use server";

import { sql } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { createSessionCookie, deleteSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

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

  redirect("/");
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

