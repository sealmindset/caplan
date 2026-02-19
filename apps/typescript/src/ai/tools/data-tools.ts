import { Tool } from '@anthropic-ai/sdk/resources/messages';

export const DATA_TOOLS: Tool[] = [
  {
    name: 'get_teams',
    description: 'Get all teams from Tempo with their basic information',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_team_members',
    description: 'Get members of a specific team with their capacity information',
    input_schema: {
      type: 'object' as const,
      properties: {
        teamId: {
          type: 'number',
          description: 'The Tempo team ID',
        },
      },
      required: ['teamId'],
    },
  },
  {
    name: 'get_user_worklogs',
    description: "Get a user's time logged (worklogs) for a specific date range",
    input_schema: {
      type: 'object' as const,
      properties: {
        userAccountId: {
          type: 'string',
          description: 'The Jira/Tempo account ID of the user',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        dateTo: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['userAccountId', 'dateFrom', 'dateTo'],
    },
  },
  {
    name: 'get_worklogs',
    description: 'Get worklogs (time entries) with various filters',
    input_schema: {
      type: 'object' as const,
      properties: {
        issueKeys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by Jira issue keys (e.g., ["PROJ-123", "PROJ-456"])',
        },
        projectKeys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by project keys',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        dateTo: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['dateFrom', 'dateTo'],
    },
  },
  {
    name: 'get_projects',
    description: 'Get all Jira projects available to the system',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_project_epics',
    description: 'Get all epics and initiatives for a specific project',
    input_schema: {
      type: 'object' as const,
      properties: {
        projectKey: {
          type: 'string',
          description: 'The Jira project key (e.g., "PROJ")',
        },
        initiativeOnly: {
          type: 'boolean',
          description: 'If true, only return initiatives. Default false.',
        },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'search_issues',
    description: 'Search for Jira issues using JQL (Jira Query Language)',
    input_schema: {
      type: 'object' as const,
      properties: {
        jql: {
          type: 'string',
          description: 'JQL query string (e.g., "project = PROJ AND status = \'In Progress\'")',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default 50)',
        },
      },
      required: ['jql'],
    },
  },
  {
    name: 'get_timesheets',
    description: 'Get timesheet data for a date range, optionally filtered by user',
    input_schema: {
      type: 'object' as const,
      properties: {
        dateFrom: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        dateTo: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        userAccountId: {
          type: 'string',
          description: 'Optional user account ID to filter by',
        },
      },
      required: ['dateFrom', 'dateTo'],
    },
  },
  {
    name: 'get_tempo_accounts',
    description: 'Get all Tempo accounts (used for categorizing time)',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'calculate_capacity_summary',
    description: 'Calculate capacity summary showing allocated vs available hours for a scope',
    input_schema: {
      type: 'object' as const,
      properties: {
        scope: {
          type: 'string',
          enum: ['team', 'user', 'project'],
          description: 'The scope for capacity calculation',
        },
        scopeId: {
          type: 'string',
          description: 'The ID of the team, user account ID, or project key',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        dateTo: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['scope', 'scopeId', 'dateFrom', 'dateTo'],
    },
  },
  {
    name: 'find_available_resources',
    description: 'Find team members with available capacity in a date range',
    input_schema: {
      type: 'object' as const,
      properties: {
        dateFrom: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        dateTo: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        minimumHoursAvailable: {
          type: 'number',
          description: 'Minimum hours of availability required (default 8)',
        },
        teamId: {
          type: 'number',
          description: 'Optional team ID to filter by',
        },
      },
      required: ['dateFrom', 'dateTo'],
    },
  },
];

export const ANALYTICS_TOOLS: Tool[] = [
  {
    name: 'detect_over_allocation',
    description: 'Find resources that are allocated over a specified capacity threshold',
    input_schema: {
      type: 'object' as const,
      properties: {
        threshold: {
          type: 'number',
          description: 'Allocation percentage threshold (default 100)',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        dateTo: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: [],
    },
  },
  {
    name: 'analyze_variance',
    description: 'Compare planned vs actual hours worked for a project or user',
    input_schema: {
      type: 'object' as const,
      properties: {
        projectKey: {
          type: 'string',
          description: 'The Jira project key',
        },
        userAccountId: {
          type: 'string',
          description: 'The user account ID',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        dateTo: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['dateFrom', 'dateTo'],
    },
  },
  {
    name: 'identify_utilization_trends',
    description: 'Analyze utilization patterns over time for a team or project',
    input_schema: {
      type: 'object' as const,
      properties: {
        scope: {
          type: 'string',
          enum: ['team', 'project'],
          description: 'Scope for trend analysis',
        },
        scopeId: {
          type: 'string',
          description: 'The team ID or project key',
        },
        periods: {
          type: 'number',
          description: 'Number of weeks to analyze (default 4)',
        },
      },
      required: ['scope', 'scopeId'],
    },
  },
];

export const ALL_TOOLS: Tool[] = [...DATA_TOOLS, ...ANALYTICS_TOOLS];
