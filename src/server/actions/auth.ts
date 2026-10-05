"use server";

import { prisma } from "@/lib/prisma";
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
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

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
