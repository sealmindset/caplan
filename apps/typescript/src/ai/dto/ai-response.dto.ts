export interface AIToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface AIToolResult {
  toolName: string;
  result: unknown;
  error?: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  conversationId?: string;
  toolCalls?: AIToolCall[];
  data?: {
    insights?: AIInsight[];
    recommendations?: string[];
    rawData?: unknown;
  };
}

export interface AIStreamChunk {
  type: 'text' | 'tool_use_start' | 'tool_result' | 'complete' | 'error';
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: unknown;
  error?: string;
}

export interface AIInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  metric?: {
    value: number;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
  };
  affectedEntities?: {
    type: 'user' | 'team' | 'project';
    id: string;
    name: string;
  }[];
  recommendation?: string;
  timestamp: Date;
}

export enum InsightType {
  OVER_ALLOCATION = 'over_allocation',
  UNDER_UTILIZATION = 'under_utilization',
  CAPACITY_AVAILABLE = 'capacity_available',
  VARIANCE_ALERT = 'variance_alert',
  TREND = 'trend',
  RECOMMENDATION = 'recommendation',
}

export enum InsightSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface DashboardInsights {
  insights: AIInsight[];
  summary: {
    totalOverAllocated: number;
    totalUnderUtilized: number;
    avgUtilization: number;
    criticalAlerts: number;
  };
  generatedAt: Date;
}
