import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsAgent, } from './agents/analytics.agent';
import { AIQueryDto, QueryContext } from './dto/ai-query.dto';
import {
  AIResponse,
  AIStreamChunk,
  AIInsight,
  DashboardInsights,
  InsightType,
  InsightSeverity,
} from './dto/ai-response.dto';
import { ToolExecutor } from './tools/tool-executor';
import { v4 as uuidv4 } from 'uuid';

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private conversations: Map<string, ConversationEntry[]> = new Map();
  private insightCache: Map<string, { insights: DashboardInsights; timestamp: number }> =
    new Map();
  private readonly cacheTTL = parseInt(process.env.AI_CACHE_TTL || '3600', 10) * 1000;

  constructor(
    private readonly analyticsAgent: AnalyticsAgent,
    private readonly toolExecutor: ToolExecutor,
  ) {}

  async processQuery(queryDto: AIQueryDto): Promise<AIResponse> {
    const { query, context, conversationId } = queryDto;
    const convId = conversationId || uuidv4();

    this.logger.log(`Processing query: "${query}" (context: ${context}, convId: ${convId})`);

    try {
      // Get or create conversation history
      const history = this.conversations.get(convId) || [];

      // Route to appropriate agent based on context and query
      const response = await this.analyticsAgent.processQuery(query, history);

      // Update conversation history
      history.push({ role: 'user', content: query });
      history.push({ role: 'assistant', content: response.message });
      this.conversations.set(convId, history);

      // Limit conversation history to last 20 messages
      if (history.length > 20) {
        this.conversations.set(convId, history.slice(-20));
      }

      return {
        success: true,
        message: response.message,
        conversationId: convId,
        toolCalls: response.toolCalls?.map((tc) => ({
          name: tc.name,
          input: tc.input,
        })),
        data: {
          rawData: response.toolCalls?.map((tc) => tc.result),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to process query: ${error.message}`, error.stack);
      return {
        success: false,
        message: `I encountered an error processing your request: ${error.message}`,
        conversationId: convId,
      };
    }
  }

  async *processQueryStream(queryDto: AIQueryDto): AsyncGenerator<AIStreamChunk> {
    const { query, context, conversationId } = queryDto;
    const convId = conversationId || uuidv4();

    this.logger.log(
      `Processing streaming query: "${query}" (context: ${context}, convId: ${convId})`,
    );

    try {
      const history = this.conversations.get(convId) || [];
      let fullResponse = '';

      for await (const chunk of this.analyticsAgent.processQueryStream(query, history)) {
        if (chunk.type === 'text' && chunk.content) {
          fullResponse += chunk.content;
        }
        yield chunk;
      }

      // Update conversation history
      history.push({ role: 'user', content: query });
      history.push({ role: 'assistant', content: fullResponse });
      this.conversations.set(convId, history);

      if (history.length > 20) {
        this.conversations.set(convId, history.slice(-20));
      }
    } catch (error) {
      this.logger.error(`Stream error: ${error.message}`, error.stack);
      yield {
        type: 'error',
        error: error.message,
      };
    }
  }

  async getDashboardInsights(context?: QueryContext): Promise<DashboardInsights> {
    const cacheKey = `dashboard-${context || 'all'}`;
    const cached = this.insightCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.logger.log('Returning cached dashboard insights');
      return cached.insights;
    }

    this.logger.log('Generating fresh dashboard insights');

    const insights: AIInsight[] = [];
    let totalOverAllocated = 0;
    let totalUnderUtilized = 0;
    let totalUtilization = 0;
    let utilizationCount = 0;
    let criticalAlerts = 0;

    try {
      // Get current week dates
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 4);

      const dateFrom = startOfWeek.toISOString().split('T')[0];
      const dateTo = endOfWeek.toISOString().split('T')[0];

      // Detect over-allocation
      const overAllocationResult = await this.toolExecutor.execute('detect_over_allocation', {
        threshold: 100,
        dateFrom,
        dateTo,
      });

      if (overAllocationResult.success && overAllocationResult.data) {
        const data = overAllocationResult.data as any;
        totalOverAllocated = data.overAllocatedCount || 0;

        if (totalOverAllocated > 0) {
          const severity =
            totalOverAllocated > 3 ? InsightSeverity.CRITICAL : InsightSeverity.WARNING;
          if (severity === InsightSeverity.CRITICAL) criticalAlerts++;

          insights.push({
            id: uuidv4(),
            type: InsightType.OVER_ALLOCATION,
            severity,
            title: 'Over-Allocated Resources',
            description: `${totalOverAllocated} team member(s) are allocated over 100% capacity this week.`,
            metric: {
              value: totalOverAllocated,
              unit: 'resources',
              trend: 'up',
            },
            affectedEntities: (data.resources || []).slice(0, 5).map((r: any) => ({
              type: 'user' as const,
              id: r.accountId,
              name: r.displayName,
            })),
            recommendation:
              'Consider redistributing work or adjusting deadlines for over-allocated team members.',
            timestamp: new Date(),
          });
        }
      }

      // Get teams and check utilization
      const teamsResult = await this.toolExecutor.execute('get_teams', {});

      if (teamsResult.success && Array.isArray(teamsResult.data)) {
        for (const team of (teamsResult.data as any[]).slice(0, 5)) {
          const capacityResult = await this.toolExecutor.execute('calculate_capacity_summary', {
            scope: 'team',
            scopeId: String(team.id),
            dateFrom,
            dateTo,
          });

          if (capacityResult.success && capacityResult.data) {
            const capacity = capacityResult.data as any;
            const utilization = capacity.utilizationPercent || 0;

            totalUtilization += utilization;
            utilizationCount++;

            if (utilization < 70 && capacity.memberCount > 0) {
              totalUnderUtilized++;
              insights.push({
                id: uuidv4(),
                type: InsightType.UNDER_UTILIZATION,
                severity: InsightSeverity.INFO,
                title: `Low Utilization: ${team.name}`,
                description: `Team "${team.name}" has ${capacity.availableHours} hours of available capacity (${100 - utilization}% unused).`,
                metric: {
                  value: utilization,
                  unit: '%',
                  trend: 'stable',
                },
                affectedEntities: [
                  {
                    type: 'team',
                    id: String(team.id),
                    name: team.name,
                  },
                ],
                recommendation:
                  'This team has capacity for additional work assignments.',
                timestamp: new Date(),
              });
            }
          }
        }
      }

      // Calculate average utilization
      const avgUtilization =
        utilizationCount > 0 ? Math.round(totalUtilization / utilizationCount) : 0;

      // Add capacity available insight if there's significant availability
      if (avgUtilization < 80) {
        insights.push({
          id: uuidv4(),
          type: InsightType.CAPACITY_AVAILABLE,
          severity: InsightSeverity.INFO,
          title: 'Capacity Available',
          description: `Average team utilization is ${avgUtilization}%. There is capacity for new initiatives.`,
          metric: {
            value: 100 - avgUtilization,
            unit: '% available',
          },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error('Error generating dashboard insights:', error);
    }

    const result: DashboardInsights = {
      insights,
      summary: {
        totalOverAllocated,
        totalUnderUtilized,
        avgUtilization: utilizationCount > 0 ? Math.round(totalUtilization / utilizationCount) : 0,
        criticalAlerts,
      },
      generatedAt: new Date(),
    };

    // Cache the results
    this.insightCache.set(cacheKey, {
      insights: result,
      timestamp: Date.now(),
    });

    return result;
  }

  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
    this.logger.log(`Cleared conversation: ${conversationId}`);
  }
}
