import { Injectable, Logger } from '@nestjs/common';
import { JiraService } from '../../integrations/jira/jira.service';
import { TempoService } from '../../integrations/tempo/tempo.service';

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

@Injectable()
export class ToolExecutor {
  private readonly logger = new Logger(ToolExecutor.name);

  constructor(
    private readonly jiraService: JiraService,
    private readonly tempoService: TempoService,
  ) {}

  async execute(toolName: string, input: Record<string, unknown>): Promise<ToolExecutionResult> {
    this.logger.log(`Executing tool: ${toolName} with input: ${JSON.stringify(input)}`);

    try {
      switch (toolName) {
        // Team and member tools
        case 'get_teams':
          return this.getTeams();
        case 'get_team_members':
          return this.getTeamMembers(input.teamId as number);

        // Worklog tools
        case 'get_user_worklogs':
          return this.getUserWorklogs(
            input.userAccountId as string,
            input.dateFrom as string,
            input.dateTo as string,
          );
        case 'get_worklogs':
          return this.getWorklogs(input);

        // Project tools
        case 'get_projects':
          return this.getProjects();
        case 'get_project_epics':
          return this.getProjectEpics(
            input.projectKey as string,
            input.initiativeOnly as boolean,
          );
        case 'search_issues':
          return this.searchIssues(
            input.jql as string,
            input.maxResults as number,
          );

        // Timesheet tools
        case 'get_timesheets':
          return this.getTimesheets(
            input.dateFrom as string,
            input.dateTo as string,
            input.userAccountId as string,
          );

        // Account tools
        case 'get_tempo_accounts':
          return this.getTempoAccounts();

        // Calculated tools
        case 'calculate_capacity_summary':
          return this.calculateCapacitySummary(
            input.scope as 'team' | 'user' | 'project',
            input.scopeId as string,
            input.dateFrom as string,
            input.dateTo as string,
          );
        case 'find_available_resources':
          return this.findAvailableResources(
            input.dateFrom as string,
            input.dateTo as string,
            input.minimumHoursAvailable as number,
            input.teamId as number,
          );

        // Analytics tools
        case 'detect_over_allocation':
          return this.detectOverAllocation(
            input.threshold as number,
            input.dateFrom as string,
            input.dateTo as string,
          );
        case 'analyze_variance':
          return this.analyzeVariance(
            input.projectKey as string,
            input.userAccountId as string,
            input.dateFrom as string,
            input.dateTo as string,
          );
        case 'identify_utilization_trends':
          return this.identifyUtilizationTrends(
            input.scope as 'team' | 'project',
            input.scopeId as string,
            input.periods as number,
          );

        default:
          return {
            success: false,
            error: `Unknown tool: ${toolName}`,
          };
      }
    } catch (error) {
      this.logger.error(`Tool execution failed: ${toolName}`, error);
      return {
        success: false,
        error: error.message || 'Tool execution failed',
      };
    }
  }

  // Team tools
  private async getTeams(): Promise<ToolExecutionResult> {
    const teams = await this.tempoService.getTeams();
    return { success: true, data: teams };
  }

  private async getTeamMembers(teamId: number): Promise<ToolExecutionResult> {
    const members = await this.tempoService.getTeamMembers(teamId);
    return { success: true, data: members };
  }

  // Worklog tools
  private async getUserWorklogs(
    userAccountId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<ToolExecutionResult> {
    const worklogs = await this.tempoService.getUserWorklogs(
      userAccountId,
      dateFrom,
      dateTo,
    );
    return { success: true, data: worklogs };
  }

  private async getWorklogs(input: Record<string, unknown>): Promise<ToolExecutionResult> {
    const worklogs = await this.tempoService.getWorklogs({
      from: input.dateFrom as string,
      to: input.dateTo as string,
      issue: input.issueKeys as string[],
      project: input.projectKeys as string[],
    });
    return { success: true, data: worklogs };
  }

  // Project tools
  private async getProjects(): Promise<ToolExecutionResult> {
    const projects = await this.jiraService.getProjects();
    // Return simplified project data
    const simplifiedProjects = projects.map((p: any) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      projectTypeKey: p.projectTypeKey,
    }));
    return { success: true, data: simplifiedProjects };
  }

  private async getProjectEpics(
    projectKey: string,
    initiativeOnly = false,
  ): Promise<ToolExecutionResult> {
    const epics = await this.jiraService.getEpics(projectKey, initiativeOnly);
    // Return simplified epic data
    const simplifiedEpics = epics.map((e: any) => ({
      key: e.key,
      summary: e.fields?.summary,
      status: e.fields?.status?.name,
      assignee: e.fields?.assignee?.displayName,
      priority: e.fields?.priority?.name,
      issueType: e.fields?.issuetype?.name,
    }));
    return { success: true, data: simplifiedEpics };
  }

  private async searchIssues(
    jql: string,
    maxResults = 50,
  ): Promise<ToolExecutionResult> {
    const result = await this.jiraService.searchIssues(jql, maxResults);
    const issues = result.issues?.map((i: any) => ({
      key: i.key,
      summary: i.fields?.summary,
      status: i.fields?.status?.name,
      assignee: i.fields?.assignee?.displayName,
      priority: i.fields?.priority?.name,
    }));
    return {
      success: true,
      data: {
        total: result.total,
        issues,
      },
    };
  }

  // Timesheet tools
  private async getTimesheets(
    dateFrom: string,
    dateTo: string,
    userAccountId?: string,
  ): Promise<ToolExecutionResult> {
    const timesheets = await this.tempoService.getTimesheets(
      dateFrom,
      dateTo,
      userAccountId,
    );
    return { success: true, data: timesheets };
  }

  // Account tools
  private async getTempoAccounts(): Promise<ToolExecutionResult> {
    const accounts = await this.tempoService.getAccounts();
    return { success: true, data: accounts };
  }

  // Capacity calculation
  private async calculateCapacitySummary(
    scope: 'team' | 'user' | 'project',
    scopeId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<ToolExecutionResult> {
    // Calculate working days in the range
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const hoursPerDay = 8;
    let totalCapacityHours = 0;
    let loggedHours = 0;
    let members: any[] = [];

    try {
      if (scope === 'team') {
        const teamId = parseInt(scopeId, 10);
        members = await this.tempoService.getTeamMembers(teamId);
        totalCapacityHours = members.length * workingDays * hoursPerDay;

        // Get worklogs for all team members
        for (const member of members) {
          if (member.member?.accountId) {
            try {
              const worklogs = await this.tempoService.getUserWorklogs(
                member.member.accountId,
                dateFrom,
                dateTo,
              );
              const memberHours = (worklogs.results || []).reduce(
                (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
                0,
              );
              loggedHours += memberHours;
            } catch (e) {
              this.logger.warn(`Could not fetch worklogs for member ${member.member.accountId}`);
            }
          }
        }
      } else if (scope === 'user') {
        totalCapacityHours = workingDays * hoursPerDay;
        const worklogs = await this.tempoService.getUserWorklogs(
          scopeId,
          dateFrom,
          dateTo,
        );
        loggedHours = (worklogs.results || []).reduce(
          (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
          0,
        );
      } else if (scope === 'project') {
        // For project scope, get worklogs for the project
        const worklogs = await this.tempoService.getWorklogs({
          from: dateFrom,
          to: dateTo,
          project: [scopeId],
        });
        loggedHours = (worklogs.results || []).reduce(
          (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
          0,
        );
        // Note: We can't easily calculate total capacity for a project
        totalCapacityHours = 0;
      }
    } catch (error) {
      this.logger.error(`Error calculating capacity for ${scope} ${scopeId}:`, error);
    }

    const utilizationPercent = totalCapacityHours > 0
      ? Math.round((loggedHours / totalCapacityHours) * 100)
      : 0;

    return {
      success: true,
      data: {
        scope,
        scopeId,
        dateRange: { from: dateFrom, to: dateTo },
        workingDays,
        totalCapacityHours: Math.round(totalCapacityHours * 10) / 10,
        loggedHours: Math.round(loggedHours * 10) / 10,
        availableHours: Math.round((totalCapacityHours - loggedHours) * 10) / 10,
        utilizationPercent,
        memberCount: members.length || (scope === 'user' ? 1 : 0),
      },
    };
  }

  // Find available resources
  private async findAvailableResources(
    dateFrom: string,
    dateTo: string,
    minimumHoursAvailable = 8,
    teamId?: number,
  ): Promise<ToolExecutionResult> {
    const availableResources: any[] = [];

    // Calculate working days in range
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const hoursPerDay = 8;
    const totalCapacityPerPerson = workingDays * hoursPerDay;

    try {
      // Get teams to check
      let teamsToCheck: any[] = [];
      if (teamId) {
        const team = await this.tempoService.getTeam(teamId);
        teamsToCheck = [team];
      } else {
        teamsToCheck = await this.tempoService.getTeams();
      }

      // Check each team's members
      for (const team of teamsToCheck) {
        const members = await this.tempoService.getTeamMembers(team.id);

        for (const member of members) {
          if (!member.member?.accountId) continue;

          try {
            const worklogs = await this.tempoService.getUserWorklogs(
              member.member.accountId,
              dateFrom,
              dateTo,
            );
            const loggedHours = (worklogs.results || []).reduce(
              (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
              0,
            );
            const availableHours = totalCapacityPerPerson - loggedHours;

            if (availableHours >= minimumHoursAvailable) {
              availableResources.push({
                accountId: member.member.accountId,
                displayName: member.member.displayName,
                teamId: team.id,
                teamName: team.name,
                totalCapacity: Math.round(totalCapacityPerPerson * 10) / 10,
                loggedHours: Math.round(loggedHours * 10) / 10,
                availableHours: Math.round(availableHours * 10) / 10,
                utilizationPercent: Math.round((loggedHours / totalCapacityPerPerson) * 100),
              });
            }
          } catch (e) {
            this.logger.warn(`Could not check availability for ${member.member?.displayName}`);
          }
        }
      }

      // Sort by available hours descending
      availableResources.sort((a, b) => b.availableHours - a.availableHours);
    } catch (error) {
      this.logger.error('Error finding available resources:', error);
    }

    return {
      success: true,
      data: {
        dateRange: { from: dateFrom, to: dateTo },
        minimumHoursRequired: minimumHoursAvailable,
        resourcesFound: availableResources.length,
        resources: availableResources,
      },
    };
  }

  // Analytics: Detect over-allocation
  private async detectOverAllocation(
    threshold = 100,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ToolExecutionResult> {
    // Use current week if dates not provided
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday

    const from = dateFrom || startOfWeek.toISOString().split('T')[0];
    const to = dateTo || endOfWeek.toISOString().split('T')[0];

    const overAllocated: any[] = [];

    // Calculate working days
    const startDate = new Date(from);
    const endDate = new Date(to);
    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const hoursPerDay = 8;
    const totalCapacity = workingDays * hoursPerDay;

    try {
      const teams = await this.tempoService.getTeams();

      for (const team of teams) {
        const members = await this.tempoService.getTeamMembers(team.id);

        for (const member of members) {
          if (!member.member?.accountId) continue;

          try {
            const worklogs = await this.tempoService.getUserWorklogs(
              member.member.accountId,
              from,
              to,
            );
            const loggedHours = (worklogs.results || []).reduce(
              (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
              0,
            );
            const utilization = (loggedHours / totalCapacity) * 100;

            if (utilization > threshold) {
              overAllocated.push({
                accountId: member.member.accountId,
                displayName: member.member.displayName,
                teamId: team.id,
                teamName: team.name,
                loggedHours: Math.round(loggedHours * 10) / 10,
                capacity: totalCapacity,
                utilizationPercent: Math.round(utilization),
                overBy: Math.round((loggedHours - totalCapacity) * 10) / 10,
              });
            }
          } catch (e) {
            // Skip members we can't check
          }
        }
      }

      // Sort by over-allocation severity
      overAllocated.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
    } catch (error) {
      this.logger.error('Error detecting over-allocation:', error);
    }

    return {
      success: true,
      data: {
        dateRange: { from, to },
        threshold,
        overAllocatedCount: overAllocated.length,
        resources: overAllocated,
      },
    };
  }

  // Analytics: Analyze variance (planned vs actual)
  private async analyzeVariance(
    projectKey?: string,
    userAccountId?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ToolExecutionResult> {
    // Use last 30 days if dates not provided
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const from = dateFrom || thirtyDaysAgo.toISOString().split('T')[0];
    const to = dateTo || now.toISOString().split('T')[0];

    try {
      let worklogs: any;

      if (userAccountId) {
        worklogs = await this.tempoService.getUserWorklogs(userAccountId, from, to);
      } else if (projectKey) {
        worklogs = await this.tempoService.getWorklogs({
          from,
          to,
          project: [projectKey],
        });
      } else {
        worklogs = await this.tempoService.getWorklogs({ from, to });
      }

      // Calculate actual hours
      const actualHours = (worklogs.results || []).reduce(
        (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
        0,
      );

      // Group by day for trend analysis
      const hoursByDay: Record<string, number> = {};
      for (const wl of worklogs.results || []) {
        const date = wl.startDate;
        if (!hoursByDay[date]) hoursByDay[date] = 0;
        hoursByDay[date] += (wl.timeSpentSeconds || 0) / 3600;
      }

      // Calculate working days
      const startDate = new Date(from);
      const endDate = new Date(to);
      let workingDays = 0;
      const current = new Date(startDate);

      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
        current.setDate(current.getDate() + 1);
      }

      const expectedHours = workingDays * 8;
      const variance = actualHours - expectedHours;
      const variancePercent = expectedHours > 0
        ? Math.round((variance / expectedHours) * 100)
        : 0;

      return {
        success: true,
        data: {
          dateRange: { from, to },
          projectKey,
          userAccountId,
          workingDays,
          expectedHours,
          actualHours: Math.round(actualHours * 10) / 10,
          variance: Math.round(variance * 10) / 10,
          variancePercent,
          dailyBreakdown: hoursByDay,
          averageHoursPerDay: workingDays > 0
            ? Math.round((actualHours / workingDays) * 10) / 10
            : 0,
        },
      };
    } catch (error) {
      this.logger.error('Error analyzing variance:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Analytics: Identify utilization trends
  private async identifyUtilizationTrends(
    scope: 'team' | 'project',
    scopeId: string,
    periods = 4,
  ): Promise<ToolExecutionResult> {
    const trends: any[] = [];
    const now = new Date();

    try {
      for (let i = periods - 1; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1 - i * 7); // Monday of that week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 4); // Friday

        const from = weekStart.toISOString().split('T')[0];
        const to = weekEnd.toISOString().split('T')[0];

        let loggedHours = 0;
        let capacity = 0;

        if (scope === 'team') {
          const teamId = parseInt(scopeId, 10);
          const members = await this.tempoService.getTeamMembers(teamId);
          capacity = members.length * 5 * 8; // 5 days * 8 hours * members

          for (const member of members) {
            if (!member.member?.accountId) continue;
            try {
              const worklogs = await this.tempoService.getUserWorklogs(
                member.member.accountId,
                from,
                to,
              );
              loggedHours += (worklogs.results || []).reduce(
                (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
                0,
              );
            } catch (e) {
              // Skip
            }
          }
        } else if (scope === 'project') {
          const worklogs = await this.tempoService.getWorklogs({
            from,
            to,
            project: [scopeId],
          });
          loggedHours = (worklogs.results || []).reduce(
            (sum: number, wl: any) => sum + (wl.timeSpentSeconds || 0) / 3600,
            0,
          );
        }

        const utilization = capacity > 0 ? Math.round((loggedHours / capacity) * 100) : 0;

        trends.push({
          weekOf: from,
          loggedHours: Math.round(loggedHours * 10) / 10,
          capacity: Math.round(capacity * 10) / 10,
          utilization,
        });
      }

      // Calculate trend direction
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (trends.length >= 2) {
        const first = trends[0].utilization;
        const last = trends[trends.length - 1].utilization;
        const diff = last - first;
        if (diff > 5) trend = 'up';
        else if (diff < -5) trend = 'down';
      }

      const avgUtilization =
        trends.length > 0
          ? Math.round(
              trends.reduce((sum, t) => sum + t.utilization, 0) / trends.length,
            )
          : 0;

      return {
        success: true,
        data: {
          scope,
          scopeId,
          periods: trends.length,
          trend,
          averageUtilization: avgUtilization,
          weeklyData: trends,
        },
      };
    } catch (error) {
      this.logger.error('Error identifying utilization trends:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
