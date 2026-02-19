import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AIService } from './ai.service';
import { AIQueryDto, AIInsightRequestDto, QueryContext } from './dto/ai-query.dto';
import { AIResponse, DashboardInsights } from './dto/ai-response.dto';

@Controller('ai')
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(private readonly aiService: AIService) {}

  @Post('query')
  async query(@Body() queryDto: AIQueryDto): Promise<AIResponse> {
    this.logger.log(`AI query received: ${queryDto.query.substring(0, 100)}...`);
    return this.aiService.processQuery(queryDto);
  }

  @Post('query/stream')
  async queryStream(
    @Body() queryDto: AIQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`AI streaming query received: ${queryDto.query.substring(0, 100)}...`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const chunk of this.aiService.processQueryStream(queryDto)) {
        const data = JSON.stringify(chunk);
        res.write(`data: ${data}\n\n`);

        // Flush the response if the method exists (compression middleware)
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
    } catch (error) {
      this.logger.error('Streaming error:', error);
      const errorChunk = JSON.stringify({
        type: 'error',
        error: error.message || 'Stream processing failed',
      });
      res.write(`data: ${errorChunk}\n\n`);
    } finally {
      res.end();
    }
  }

  @Get('insights/dashboard')
  async getDashboardInsights(
    @Query() requestDto: AIInsightRequestDto,
  ): Promise<DashboardInsights> {
    this.logger.log(`Dashboard insights requested for context: ${requestDto.context || 'all'}`);
    return this.aiService.getDashboardInsights(requestDto.context);
  }

  @Delete('conversations/:conversationId')
  async clearConversation(
    @Param('conversationId') conversationId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.aiService.clearConversation(conversationId);
    return {
      success: true,
      message: `Conversation ${conversationId} cleared`,
    };
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; model: string }> {
    return {
      status: 'ok',
      model: process.env.AI_DEFAULT_MODEL || 'claude-sonnet-4-20250514',
    };
  }
}
