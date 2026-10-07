import { sql } from "@/lib/db";
import { getTodayMakassar, getWeekDays, getLastNDays } from "@/lib/date-utils";
import { getSession } from "@/lib/auth";
import { decryptPassword } from "@/lib/encryption";

async function resolveUserId(explicitUserId?: string): Promise<string> {
  if (explicitUserId) return explicitUserId;
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session.id;
}

export interface DashboardStats {
  totalAccounts: number;
  activeAccounts: number;
  completedToday: number;
  inProgressToday: number;
  notStartedToday: number;
  overallProgress: number;
  needAttention: {
    id: string;
    nickname: string;
    owner: string;
    job: string;
    server: string;
    completedCount: number;
    totalCount: number;
    progress: number;
  }[];
}

export async function getDashboardStats(
  dateStr: string = getTodayMakassar(),
  explicitUserId?: string
): Promise<DashboardStats> {
  const userId = await resolveUserId(explicitUserId);
  const weekDays = getWeekDays(dateStr);
  const mondayStr = weekDays[0].dateStr;
  const sundayStr = weekDays[6].dateStr;

  const [accountsRaw, masterActivitiesRaw, assignedRaw, todayLogsRaw] = await (sql as any).transaction([
    sql`SELECT id, nickname, username, owner, job, server, status FROM accounts WHERE user_id = ${userId} ORDER BY username ASC, nickname ASC;`,
    sql`SELECT id FROM activities WHERE user_id = ${userId} AND is_active = TRUE;`,
    sql`
      SELECT aa.account_id, aa.activity_id
      FROM account_activities aa
      JOIN accounts a ON aa.account_id = a.id
      WHERE a.user_id = ${userId} AND aa.is_active = TRUE;
    `,
    sql`
      SELECT DISTINCT al.account_id, al.activity_id
      FROM activity_logs al
      JOIN accounts a ON al.account_id = a.id
      JOIN activities act ON al.activity_id = act.id
      WHERE a.user_id = ${userId}
        AND al.is_completed = TRUE
        AND (
          (act.activity_type = 'DAILY' AND al.activity_date = ${dateStr})
          OR
          (act.activity_type = 'WEEKLY' AND al.activity_date >= ${mondayStr} AND al.activity_date <= ${sundayStr})
        );
    `,
  ]);

  const accounts = accountsRaw as { id: string; nickname: string; owner: string; job: string; server: string; status: string }[];
  const masterActivities = masterActivitiesRaw as { id: string }[];
  const assignedActivities = assignedRaw as { account_id: string; activity_id: string }[];
  const todayLogs = todayLogsRaw as { account_id: string; activity_id: string }[];

  const activeMasterIds = new Set(masterActivities.map((a) => a.id));

  // Map assigned activities per account
  const assignedByAccount = new Map<string, Set<string>>();
  for (const aa of assignedActivities) {
    if (activeMasterIds.has(aa.activity_id)) {
      if (!assignedByAccount.has(aa.account_id)) {
        assignedByAccount.set(aa.account_id, new Set());
      }
      assignedByAccount.get(aa.account_id)!.add(aa.activity_id);
    }
  }

  // Map completed activities per account
  const completedByAccount = new Map<string, Set<string>>();
  for (const log of todayLogs) {
    if (!completedByAccount.has(log.account_id)) {
      completedByAccount.set(log.account_id, new Set());
    }
    completedByAccount.get(log.account_id)!.add(log.activity_id);
  }

  const totalAccounts = accounts.length;
  const activeAccountsList = accounts.filter((a) => a.status === "Active");
  const activeAccountsCount = activeAccountsList.length;

  let completedToday = 0;
  let inProgressToday = 0;
  let notStartedToday = 0;
  let totalAssignedAll = 0;
  let totalCompletedAll = 0;

  const needAttention: DashboardStats["needAttention"] = [];

  for (const acc of activeAccountsList) {
    const assignedSet = assignedByAccount.get(acc.id) || new Set();
    const totalAssigned = assignedSet.size;

    if (totalAssigned === 0) continue;

    const completedSet = completedByAccount.get(acc.id) || new Set();
    let completedCount = 0;
    for (const actId of completedSet) {
      if (assignedSet.has(actId)) completedCount++;
    }

    totalAssignedAll += totalAssigned;
    totalCompletedAll += completedCount;

    const progress = Math.round((completedCount / totalAssigned) * 100);

    if (completedCount === totalAssigned) {
      completedToday++;
    } else if (completedCount > 0) {
      inProgressToday++;
      needAttention.push({
        id: acc.id,
        nickname: acc.nickname,
        owner: acc.owner,
        job: acc.job,
        server: acc.server,
        completedCount,
        totalCount: totalAssigned,
        progress,
      });
    } else {
      notStartedToday++;
      needAttention.push({
        id: acc.id,
        nickname: acc.nickname,
        owner: acc.owner,
        job: acc.job,
        server: acc.server,
        completedCount,
        totalCount: totalAssigned,
        progress,
      });
    }
  }

  needAttention.sort((a, b) => b.completedCount - a.completedCount);

  const overallProgress =
    totalAssignedAll > 0
      ? Math.round((totalCompletedAll / totalAssignedAll) * 100)
      : 0;

  return {
    totalAccounts,
    activeAccounts: activeAccountsCount,
    completedToday,
    inProgressToday,
    notStartedToday,
    overallProgress,
    needAttention,
  };
}

export interface TrackerActivityItem {
  id: string;
  name: string;
  code: string;
  activityType: "DAILY" | "WEEKLY";
  sortOrder: number;
}

export interface TrackerAccountRow {
  id: string;
  nickname: string;
  username: string;
  password?: string;
  server: string;
  owner: string;
  job: string;
  level: number;
  status: "Active" | "Paused" | "Finished";
  zeny: number;
  groupId: string | null;
  groupName: string | null;
  assignedActivityIds: string[];
  completedActivityIds: string[];
  totalAssigned: number;
  completedCount: number;
  progressPercent: number;
}

export interface TrackerData {
  dateStr: string;
  activities: TrackerActivityItem[];
  accounts: TrackerAccountRow[];
  groups: { id: string; name: string }[];
  summary: {
    totalAccounts: number;
    completedAccounts: number;
    inProgressAccounts: number;
    notStartedAccounts: number;
    totalTasks: number;
    completedTasks: number;
    overallProgress: number;
  };
}

export async function getTrackerData(
  dateStr: string = getTodayMakassar(),
  explicitUserId?: string
): Promise<TrackerData> {
  const userId = await resolveUserId(explicitUserId);
  const weekDays = getWeekDays(dateStr);
  const mondayStr = weekDays[0].dateStr;
  const sundayStr = weekDays[6].dateStr;

  const [activitiesRaw, accountsRaw, groupsRaw, assignedRaw, logsRaw] = await (sql as any).transaction([
    sql`SELECT id, name, code, activity_type, sort_order FROM activities WHERE user_id = ${userId} AND is_active = TRUE ORDER BY sort_order ASC, created_at ASC;`,
    sql`
      SELECT a.id, a.nickname, a.username, a.password, a.server, a.owner, a.job, a.level, a.status, a.group_id, a.zeny, g.name as group_name
      FROM accounts a
      LEFT JOIN groups g ON a.group_id = g.id
      WHERE a.user_id = ${userId}
      ORDER BY a.username ASC, a.nickname ASC;
    `,
    sql`SELECT id, name FROM groups WHERE user_id = ${userId} ORDER BY name ASC;`,
    sql`
      SELECT aa.account_id, aa.activity_id
      FROM account_activities aa
      JOIN accounts a ON aa.account_id = a.id
      WHERE a.user_id = ${userId} AND aa.is_active = TRUE;
    `,
    sql`
      SELECT DISTINCT al.account_id, al.activity_id
      FROM activity_logs al
      JOIN accounts a ON al.account_id = a.id
      JOIN activities act ON al.activity_id = act.id
      WHERE a.user_id = ${userId} 
        AND al.is_completed = TRUE
        AND (
          (act.activity_type = 'DAILY' AND al.activity_date = ${dateStr})
          OR
          (act.activity_type = 'WEEKLY' AND al.activity_date >= ${mondayStr} AND al.activity_date <= ${sundayStr})
        );
    `,
  ]);

  const activities: TrackerActivityItem[] = (activitiesRaw as any[]).map((a) => ({
    id: String(a.id),
    name: String(a.name),
    code: String(a.code),
    activityType: (a.activity_type || "DAILY") as "DAILY" | "WEEKLY",
    sortOrder: Number(a.sort_order),
  }));

  const accountsList = accountsRaw as any[];
  const groupsList = groupsRaw as any[];
  const assignedList = assignedRaw as any[];
  const logsList = logsRaw as any[];

  const activeMasterIds = new Set(activities.map((a) => a.id));

  // Build assigned map
  const assignedMap = new Map<string, string[]>();
  for (const aa of assignedList) {
    const actId = String(aa.activity_id);
    const accId = String(aa.account_id);
    if (activeMasterIds.has(actId)) {
      if (!assignedMap.has(accId)) {
        assignedMap.set(accId, []);
      }
      assignedMap.get(accId)!.push(actId);
    }
  }

  // Build completed map (ensuring unique activity IDs per account)
  const completedMap = new Map<string, Set<string>>();
  for (const log of logsList) {
    const accId = String(log.account_id);
    const actId = String(log.activity_id);
    if (!completedMap.has(accId)) {
      completedMap.set(accId, new Set());
    }
    completedMap.get(accId)!.add(actId);
  }

  let completedAccounts = 0;
  let inProgressAccounts = 0;
  let notStartedAccounts = 0;
  let totalTasks = 0;
  let completedTasks = 0;

  const accountRows: TrackerAccountRow[] = accountsList.map((acc) => {
    const accId = String(acc.id);
    const assignedActivityIds = assignedMap.get(accId) || [];
    const assignedSet = new Set(assignedActivityIds);

    const completedSet = completedMap.get(accId) || new Set<string>();
    const completedActivityIds = assignedActivityIds.filter((id) => completedSet.has(id));

    const totalAssigned = assignedActivityIds.length;
    const completedCount = completedActivityIds.length;
    const progressPercent =
      totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

    const status = String(acc.status);
    if (status === "Active") {
      totalTasks += totalAssigned;
      completedTasks += completedCount;

      if (totalAssigned > 0) {
        if (completedCount === totalAssigned) completedAccounts++;
        else if (completedCount > 0) inProgressAccounts++;
        else notStartedAccounts++;
      }
    }

    return {
      id: accId,
      nickname: String(acc.nickname),
      username: String(acc.username),
      password: acc.password ? decryptPassword(String(acc.password)) : "",
      server: String(acc.server),
      owner: String(acc.owner),
      job: String(acc.job),
      level: Number(acc.level),
      status: status as "Active" | "Paused" | "Finished",
      zeny: Number(acc.zeny || 0),
      groupId: acc.group_id ? String(acc.group_id) : null,
      groupName: acc.group_name ? String(acc.group_name) : null,
      assignedActivityIds,
      completedActivityIds,
      totalAssigned,
      completedCount,
      progressPercent,
    };
  });

  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    dateStr,
    activities,
    accounts: accountRows,
    groups: groupsList.map((g) => ({ id: String(g.id), name: String(g.name) })),
    summary: {
      totalAccounts: accountsList.filter((a) => a.status === "Active").length,
      completedAccounts,
      inProgressAccounts,
      notStartedAccounts,
      totalTasks,
      completedTasks,
      overallProgress,
    },
  };
}

export interface WeeklyAccountRow {
  id: string;
  nickname: string;
  server: string;
  owner: string;
  job: string;
  status: "Active" | "Paused" | "Finished";
  groupName: string | null;
  dailyStatus: {
    dateStr: string;
    status: "COMPLETED" | "PARTIAL" | "NOT_STARTED" | "NO_TASKS";
    completedCount: number;
    totalAssigned: number;
  }[];
}

export async function getWeeklyData(
  baseDateStr: string = getTodayMakassar(),
  explicitUserId?: string
): Promise<{
  weekDays: ReturnType<typeof getWeekDays>;
  accounts: WeeklyAccountRow[];
}> {
  const userId = await resolveUserId(explicitUserId);
  const weekDays = getWeekDays(baseDateStr);
  const startDateStr = weekDays[0].dateStr;
  const endDateStr = weekDays[6].dateStr;

  const [accountsRaw, masterActivitiesRaw, assignedRaw, logsRaw] = await (sql as any).transaction([
    sql`
      SELECT a.id, a.nickname, a.username, a.server, a.owner, a.job, a.status, g.name as group_name
      FROM accounts a
      LEFT JOIN groups g ON a.group_id = g.id
      WHERE a.user_id = ${userId}
      ORDER BY a.username ASC, a.nickname ASC;
    `,
    sql`SELECT id FROM activities WHERE user_id = ${userId} AND is_active = TRUE;`,
    sql`
      SELECT aa.account_id, aa.activity_id
      FROM account_activities aa
      JOIN accounts a ON aa.account_id = a.id
      WHERE a.user_id = ${userId} AND aa.is_active = TRUE;
    `,
    sql`
      SELECT al.account_id, al.activity_id, al.activity_date
      FROM activity_logs al
      JOIN accounts a ON al.account_id = a.id
      WHERE a.user_id = ${userId} AND al.activity_date >= ${startDateStr} AND al.activity_date <= ${endDateStr} AND al.is_completed = TRUE;
    `,
  ]);

  const accountsList = accountsRaw as any[];
  const masterActivities = masterActivitiesRaw as any[];
  const assignedList = assignedRaw as any[];
  const logsList = logsRaw as any[];

  const activeMasterIds = new Set(masterActivities.map((a) => String(a.id)));

  // Map assigned
  const assignedMap = new Map<string, Set<string>>();
  for (const aa of assignedList) {
    const actId = String(aa.activity_id);
    const accId = String(aa.account_id);
    if (activeMasterIds.has(actId)) {
      if (!assignedMap.has(accId)) {
        assignedMap.set(accId, new Set());
      }
      assignedMap.get(accId)!.add(actId);
    }
  }

  // Map logs: account_id -> date -> count
  const logsMap = new Map<string, Map<string, number>>();
  for (const log of logsList) {
    const accId = String(log.account_id);
    const actId = String(log.activity_id);
    const actDate = String(log.activity_date);
    const accAssigned = assignedMap.get(accId);
    if (accAssigned && accAssigned.has(actId)) {
      if (!logsMap.has(accId)) {
        logsMap.set(accId, new Map());
      }
      const dateMap = logsMap.get(accId)!;
      dateMap.set(actDate, (dateMap.get(actDate) || 0) + 1);
    }
  }

  const resultRows: WeeklyAccountRow[] = accountsList.map((acc) => {
    const accId = String(acc.id);
    const assignedSet = assignedMap.get(accId) || new Set();
    const totalAssigned = assignedSet.size;
    const dateLogs = logsMap.get(accId);

    const dailyStatus = weekDays.map((day) => {
      const completed = dateLogs?.get(day.dateStr) || 0;
      let status: "COMPLETED" | "PARTIAL" | "NOT_STARTED" | "NO_TASKS" = "NOT_STARTED";

      if (totalAssigned === 0) {
        status = "NO_TASKS";
      } else if (completed === totalAssigned) {
        status = "COMPLETED";
      } else if (completed > 0) {
        status = "PARTIAL";
      } else {
        status = "NOT_STARTED";
      }

      return {
        dateStr: day.dateStr,
        status,
        completedCount: completed,
        totalAssigned,
      };
    });

    return {
      id: accId,
      nickname: String(acc.nickname),
      server: String(acc.server),
      owner: String(acc.owner),
      job: String(acc.job),
      status: String(acc.status) as "Active" | "Paused" | "Finished",
      groupName: acc.group_name ? String(acc.group_name) : null,
      dailyStatus,
    };
  });

  return {
    weekDays,
    accounts: resultRows,
  };
}

export async function getAccountsList(explicitUserId?: string) {
  const userId = await resolveUserId(explicitUserId);

  const [accountsRaw, activitiesRaw] = await (sql as any).transaction([
    sql`
      SELECT a.id, a.nickname, a.username, a.password, a.server, a.owner, a.job, a.level, a.start_date, a.status, a.notes, a.group_id, a.zeny, a.created_at, a.updated_at, g.name as group_name
      FROM accounts a
      LEFT JOIN groups g ON a.group_id = g.id
      WHERE a.user_id = ${userId}
      ORDER BY a.username ASC, a.nickname ASC;
    `,
    sql`
      SELECT aa.account_id, aa.activity_id, act.name, act.code
      FROM account_activities aa
      JOIN accounts a ON aa.account_id = a.id
      JOIN activities act ON aa.activity_id = act.id
      WHERE a.user_id = ${userId} AND aa.is_active = TRUE;
    `,
  ]);

  const activitiesMap = new Map<string, { activityId: string; activity: { id: string; name: string; code: string } }[]>();
  for (const act of (activitiesRaw as any[])) {
    const accId = String(act.account_id);
    if (!activitiesMap.has(accId)) {
      activitiesMap.set(accId, []);
    }
    activitiesMap.get(accId)!.push({
      activityId: String(act.activity_id),
      activity: { id: String(act.activity_id), name: String(act.name), code: String(act.code) },
    });
  }

  return (accountsRaw as any[]).map((acc) => ({
    id: String(acc.id),
    nickname: String(acc.nickname),
    username: String(acc.username),
    password: acc.password ? decryptPassword(String(acc.password)) : "",
    server: String(acc.server),
    owner: String(acc.owner),
    job: String(acc.job),
    level: Number(acc.level),
    startDate: new Date(acc.start_date),
    status: String(acc.status) as "Active" | "Paused" | "Finished",
    notes: acc.notes ? String(acc.notes) : null,
    groupId: acc.group_id ? String(acc.group_id) : null,
    zeny: Number(acc.zeny || 0),
    group: acc.group_id ? { id: String(acc.group_id), name: String(acc.group_name || "") } : null,
    createdAt: new Date(acc.created_at),
    updatedAt: new Date(acc.updated_at),
    accountActivities: activitiesMap.get(String(acc.id)) || [],
  }));
}

export async function getAccountDetail(id: string, explicitUserId?: string) {
  const userId = await resolveUserId(explicitUserId);
  const todayStr = getTodayMakassar();
  const last30Days = getLastNDays(30, todayStr);
  const startDateStr = last30Days[0];

  const [accountRows, activitiesRows, groupRows, logsRaw] = await (sql as any).transaction([
    sql`SELECT * FROM accounts WHERE id = ${id} AND user_id = ${userId} LIMIT 1;`,
    sql`
      SELECT aa.id, aa.activity_id, aa.is_active, act.name, act.code, act.sort_order
      FROM account_activities aa
      JOIN activities act ON aa.activity_id = act.id
      WHERE aa.account_id = ${id}
      ORDER BY act.sort_order ASC;
    `,
    sql`SELECT g.id, g.name FROM groups g JOIN accounts a ON a.group_id = g.id WHERE a.id = ${id} AND a.user_id = ${userId} LIMIT 1;`,
    sql`
      SELECT activity_id, activity_date, is_completed, completed_at
      FROM activity_logs
      WHERE account_id = ${id} AND activity_date >= ${startDateStr} AND activity_date <= ${todayStr};
    `,
  ]);

  const accList = accountRows as any[];
  if (accList.length === 0) return null;
  const acc = accList[0];

  const logs = logsRaw as any[];
  const actList = activitiesRows as any[];
  const grpList = groupRows as any[];

  return {
    account: {
      id: String(acc.id),
      nickname: String(acc.nickname),
      username: String(acc.username),
      password: acc.password ? decryptPassword(String(acc.password)) : "",
      server: String(acc.server),
      owner: String(acc.owner),
      job: String(acc.job),
      level: Number(acc.level),
      startDate: new Date(acc.start_date),
      status: String(acc.status) as "Active" | "Paused" | "Finished",
      notes: acc.notes ? String(acc.notes) : null,
      groupId: acc.group_id ? String(acc.group_id) : null,
      zeny: Number(acc.zeny || 0),
      group: grpList.length > 0 ? { id: String(grpList[0].id), name: String(grpList[0].name) } : null,
      accountActivities: actList.map((aa) => ({
        id: String(aa.id),
        activityId: String(aa.activity_id),
        isActive: Boolean(aa.is_active),
        activity: {
          id: String(aa.activity_id),
          name: String(aa.name),
          code: String(aa.code),
          sortOrder: Number(aa.sort_order),
        },
      })),
    },
    last30Days,
    logs: logs.map((l) => ({
      activityId: String(l.activity_id),
      activityDate: String(l.activity_date),
      isCompleted: Boolean(l.is_completed),
      completedAt: l.completed_at ? new Date(l.completed_at) : null,
    })),
  };
}

export async function getMasterActivities(explicitUserId?: string) {
  const userId = await resolveUserId(explicitUserId);

  const [activities, counts] = await (sql as any).transaction([
    sql`SELECT id, name, code, activity_type, sort_order, is_active FROM activities WHERE user_id = ${userId} ORDER BY sort_order ASC, created_at ASC;`,
    sql`
      SELECT aa.activity_id, count(*) as count
      FROM account_activities aa
      JOIN accounts a ON aa.account_id = a.id
      WHERE a.user_id = ${userId}
      GROUP BY aa.activity_id;
    `,
  ]);

  const countMap = new Map<string, number>();
  for (const c of (counts as any[])) {
    countMap.set(String(c.activity_id), parseInt(c.count, 10));
  }

  return (activities as any[]).map((act) => ({
    id: String(act.id),
    name: String(act.name),
    code: String(act.code),
    activityType: (act.activity_type || "DAILY") as "DAILY" | "WEEKLY",
    sortOrder: Number(act.sort_order),
    isActive: Boolean(act.is_active),
    _count: {
      accountActivities: countMap.get(String(act.id)) || 0,
    },
  }));
}

export async function getGroups(explicitUserId?: string) {
  const userId = await resolveUserId(explicitUserId);

  const [groups, counts] = await (sql as any).transaction([
    sql`SELECT id, name, created_at FROM groups WHERE user_id = ${userId} ORDER BY name ASC;`,
    sql`SELECT group_id, count(*) as count FROM accounts WHERE user_id = ${userId} AND group_id IS NOT NULL GROUP BY group_id;`,
  ]);

  const countMap = new Map<string, number>();
  for (const c of (counts as any[])) {
    countMap.set(String(c.group_id), parseInt(c.count, 10));
  }

  return (groups as any[]).map((g) => ({
    id: String(g.id),
    name: String(g.name),
    createdAt: new Date(g.created_at),
    _count: {
      accounts: countMap.get(String(g.id)) || 0,
    },
  }));
}
