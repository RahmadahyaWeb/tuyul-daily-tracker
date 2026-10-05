import { prisma } from "@/lib/prisma";
import { getTodayMakassar, getWeekDays, getLastNDays } from "@/lib/date-utils";

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

export async function getDashboardStats(dateStr: string = getTodayMakassar()): Promise<DashboardStats> {
  const [accounts, masterActivities] = await Promise.all([
    prisma.account.findMany({
      select: {
        id: true,
        nickname: true,
        owner: true,
        job: true,
        server: true,
        status: true,
        accountActivities: {
          where: { isActive: true },
          select: { activityId: true },
        },
        activityLogs: {
          where: { activityDate: dateStr, isCompleted: true },
          select: { activityId: true },
        },
      },
    }),
    prisma.activity.findMany({
      where: { isActive: true },
      select: { id: true },
    }),
  ]);

  const activeMasterIds = new Set(masterActivities.map((a) => a.id));
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
    // Only count activities that are currently active master activities AND active for this account
    const assignedIds = acc.accountActivities
      .map((aa) => aa.activityId)
      .filter((id) => activeMasterIds.has(id));

    const totalAssigned = assignedIds.length;
    if (totalAssigned === 0) {
      continue;
    }

    const assignedSet = new Set(assignedIds);
    const completedCount = acc.activityLogs.filter((log) =>
      assignedSet.has(log.activityId)
    ).length;

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

  // Sort need attention: prioritize in-progress and higher completion or least progress
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
  sortOrder: number;
}

export interface TrackerAccountRow {
  id: string;
  nickname: string;
  username: string;
  server: string;
  owner: string;
  job: string;
  level: number;
  status: "Active" | "Paused" | "Finished";
  groupId: string | null;
  groupName: string | null;
  assignedActivityIds: string[]; // Activity IDs enabled for this account
  completedActivityIds: string[]; // Activity IDs checked for this date
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

export async function getTrackerData(dateStr: string = getTodayMakassar()): Promise<TrackerData> {
  const [activities, accounts, groups] = await Promise.all([
    prisma.activity.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, code: true, sortOrder: true },
    }),
    prisma.account.findMany({
      orderBy: [{ nickname: "asc" }],
      select: {
        id: true,
        nickname: true,
        username: true,
        server: true,
        owner: true,
        job: true,
        level: true,
        status: true,
        groupId: true,
        group: { select: { id: true, name: true } },
        accountActivities: {
          where: { isActive: true },
          select: { activityId: true },
        },
        activityLogs: {
          where: { activityDate: dateStr, isCompleted: true },
          select: { activityId: true },
        },
      },
    }),
    prisma.group.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const activeMasterIds = new Set(activities.map((a) => a.id));

  let completedAccounts = 0;
  let inProgressAccounts = 0;
  let notStartedAccounts = 0;
  let totalTasks = 0;
  let completedTasks = 0;

  const accountRows: TrackerAccountRow[] = accounts.map((acc) => {
    // Assigned activities filtered by active master activities
    const assignedActivityIds = acc.accountActivities
      .map((aa) => aa.activityId)
      .filter((id) => activeMasterIds.has(id));

    const assignedSet = new Set(assignedActivityIds);
    const completedActivityIds = acc.activityLogs
      .map((log) => log.activityId)
      .filter((id) => assignedSet.has(id));

    const totalAssigned = assignedActivityIds.length;
    const completedCount = completedActivityIds.length;
    const progressPercent =
      totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

    if (acc.status === "Active") {
      totalTasks += totalAssigned;
      completedTasks += completedCount;

      if (totalAssigned > 0) {
        if (completedCount === totalAssigned) completedAccounts++;
        else if (completedCount > 0) inProgressAccounts++;
        else notStartedAccounts++;
      }
    }

    return {
      id: acc.id,
      nickname: acc.nickname,
      username: acc.username,
      server: acc.server,
      owner: acc.owner,
      job: acc.job,
      level: acc.level,
      status: acc.status as "Active" | "Paused" | "Finished",
      groupId: acc.groupId,
      groupName: acc.group?.name || null,
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
    groups,
    summary: {
      totalAccounts: accounts.filter((a) => a.status === "Active").length,
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

export async function getWeeklyData(baseDateStr: string = getTodayMakassar()): Promise<{
  weekDays: ReturnType<typeof getWeekDays>;
  accounts: WeeklyAccountRow[];
}> {
  const weekDays = getWeekDays(baseDateStr);
  const startDateStr = weekDays[0].dateStr;
  const endDateStr = weekDays[6].dateStr;

  const [accounts, masterActivities] = await Promise.all([
    prisma.account.findMany({
      orderBy: [{ nickname: "asc" }],
      select: {
        id: true,
        nickname: true,
        server: true,
        owner: true,
        job: true,
        status: true,
        group: { select: { name: true } },
        accountActivities: {
          where: { isActive: true },
          select: { activityId: true },
        },
        activityLogs: {
          where: {
            activityDate: {
              gte: startDateStr,
              lte: endDateStr,
            },
            isCompleted: true,
          },
          select: { activityId: true, activityDate: true },
        },
      },
    }),
    prisma.activity.findMany({
      where: { isActive: true },
      select: { id: true },
    }),
  ]);

  const activeMasterIds = new Set(masterActivities.map((a) => a.id));

  const resultRows: WeeklyAccountRow[] = accounts.map((acc) => {
    const assignedIds = acc.accountActivities
      .map((aa) => aa.activityId)
      .filter((id) => activeMasterIds.has(id));

    const totalAssigned = assignedIds.length;
    const assignedSet = new Set(assignedIds);

    // Map logs by date
    const logsByDate = new Map<string, number>();
    for (const log of acc.activityLogs) {
      if (assignedSet.has(log.activityId)) {
        logsByDate.set(log.activityDate, (logsByDate.get(log.activityDate) || 0) + 1);
      }
    }

    const dailyStatus = weekDays.map((day) => {
      const completed = logsByDate.get(day.dateStr) || 0;
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
      id: acc.id,
      nickname: acc.nickname,
      server: acc.server,
      owner: acc.owner,
      job: acc.job,
      status: acc.status as "Active" | "Paused" | "Finished",
      groupName: acc.group?.name || null,
      dailyStatus,
    };
  });

  return {
    weekDays,
    accounts: resultRows,
  };
}

export async function getAccountsList() {
  return prisma.account.findMany({
    orderBy: { nickname: "asc" },
    select: {
      id: true,
      nickname: true,
      username: true,
      server: true,
      owner: true,
      job: true,
      level: true,
      startDate: true,
      status: true,
      notes: true,
      groupId: true,
      group: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
      accountActivities: {
        where: { isActive: true },
        select: {
          activityId: true,
          activity: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });
}

export async function getAccountDetail(id: string) {
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      group: true,
      accountActivities: {
        include: {
          activity: true,
        },
        orderBy: { activity: { sortOrder: "asc" } },
      },
    },
  });

  if (!account) return null;

  const todayStr = getTodayMakassar();
  const last30Days = getLastNDays(30, todayStr);
  const startDateStr = last30Days[0];

  const logs = await prisma.activityLog.findMany({
    where: {
      accountId: id,
      activityDate: {
        gte: startDateStr,
        lte: todayStr,
      },
    },
    select: {
      activityId: true,
      activityDate: true,
      isCompleted: true,
      completedAt: true,
    },
  });

  return {
    account,
    last30Days,
    logs,
  };
}

export async function getMasterActivities() {
  return prisma.activity.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: { accountActivities: true },
      },
    },
  });
}

export async function getGroups() {
  return prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { accounts: true },
      },
    },
  });
}
