import { getSession, SessionUser } from "./auth";
import { sql } from "./db";
import { getPlan, PlanConfig } from "./plans";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "MEMBER";
  plan: PlanConfig;
  accountCount: number;
}

/**
 * Ensures user is authenticated and retrieves their active workspace.
 */
export async function requireWorkspace(explicitUserId?: string): Promise<{
  user: SessionUser;
  workspace: Workspace;
}> {
  let user: SessionUser | null = null;
  if (explicitUserId) {
    const rows = await sql`SELECT id, username, role FROM users WHERE id = ${explicitUserId} LIMIT 1;`;
    if (rows.length > 0) {
      user = {
        id: rows[0].id,
        username: rows[0].username,
        role: rows[0].role as "ADMIN" | "USER",
      };
    }
  } else {
    user = await getSession();
  }

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Count active accounts to determine usage against plan
  const countRes = await sql`
    SELECT count(*)::int as count FROM accounts WHERE user_id = ${user.id};
  `;
  const accountCount = Number(countRes[0]?.count || 0);

  // Default plan is Free unless role is ADMIN or marked PRO
  const planType = user.role === "ADMIN" ? "PRO" : "FREE";
  const plan = getPlan(planType);

  const workspace: Workspace = {
    id: user.id,
    name: `${user.username}'s Workspace`,
    slug: user.username.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    role: "OWNER",
    plan,
    accountCount,
  };

  return { user, workspace };
}
