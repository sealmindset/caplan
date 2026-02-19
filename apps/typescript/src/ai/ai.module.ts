import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AnalyticsAgent } from './agents/analytics.agent';
import { ToolExecutor } from './tools/tool-executor';
import { JiraModule } from '../integrations/jira/jira.module';
import { TempoModule } from '../integrations/tempo/tempo.module';

@Module({
  imports: [JiraModule, TempoModule],
  controllers: [AIController],
  providers: [AIService, AnalyticsAgent, ToolExecutor],
  exports: [AIService],
})
export class AIModule {}
