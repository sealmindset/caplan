import { Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { Tool, Message, ContentBlock, ToolUseBlock, TextBlock } from '@anthropic-ai/sdk/resources/messages';
import { ToolExecutor } from '../tools/tool-executor';

export interface AgentResponse {
  message: string;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
    result: unknown;
  }>;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface StreamChunk {
  type: 'text' | 'tool_use_start' | 'tool_result' | 'complete' | 'error';
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: unknown;
  error?: string;
}

export abstract class BaseAgent {
  protected readonly logger: Logger;
  protected client: Anthropic;
  protected model: string;
  protected maxTokens: number;

  constructor(
    protected readonly toolExecutor: ToolExecutor,
    agentName: string,
    model?: string,
    maxTokens?: number,
  ) {
    this.logger = new Logger(agentName);
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = model || process.env.AI_DEFAULT_MODEL || 'claude-sonnet-4-20250514';
    this.maxTokens = maxTokens || 4096;
  }

  protected abstract getSystemPrompt(): string;
  protected abstract getTools(): Tool[];

  async processQuery(
    query: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<AgentResponse> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(conversationHistory || []),
      { role: 'user', content: query },
    ];

    let fullResponse = '';
    const toolCalls: AgentResponse['toolCalls'] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // Agentic loop - continue until no more tool calls
    let continueLoop = true;
    while (continueLoop) {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: this.getSystemPrompt(),
        tools: this.getTools(),
        messages,
      });

      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;

      // Process response content
      const toolUseBlocks: ToolUseBlock[] = [];
      for (const block of response.content) {
        if (block.type === 'text') {
          fullResponse += (block as TextBlock).text;
        } else if (block.type === 'tool_use') {
          toolUseBlocks.push(block as ToolUseBlock);
        }
      }

      // If no tool calls, we're done
      if (toolUseBlocks.length === 0) {
        continueLoop = false;
        break;
      }

      // Add assistant message with tool use to conversation
      messages.push({
        role: 'assistant',
        content: response.content as any,
      });

      // Execute tools and collect results
      const toolResults: Array<{
        type: 'tool_result';
        tool_use_id: string;
        content: string;
      }> = [];

      for (const toolUse of toolUseBlocks) {
        this.logger.log(`Executing tool: ${toolUse.name}`);
        const result = await this.toolExecutor.execute(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
        );

        toolCalls.push({
          name: toolUse.name,
          input: toolUse.input as Record<string, unknown>,
          result: result.data || result.error,
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result.success ? result.data : { error: result.error }),
        });
      }

      // Add tool results to conversation
      messages.push({
        role: 'user',
        content: toolResults as any,
      });

      // Check if we should continue (model might return end_turn)
      if (response.stop_reason === 'end_turn') {
        continueLoop = false;
      }
    }

    return {
      message: fullResponse,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
    };
  }

  async *processQueryStream(
    query: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): AsyncGenerator<StreamChunk> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(conversationHistory || []),
      { role: 'user', content: query },
    ];

    let continueLoop = true;

    while (continueLoop) {
      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        system: this.getSystemPrompt(),
        tools: this.getTools(),
        messages,
      });

      let currentToolUse: { id: string; name: string; input: string } | null = null;
      const toolUseBlocks: ToolUseBlock[] = [];
      let textContent = '';

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolUse = {
              id: event.content_block.id,
              name: event.content_block.name,
              input: '',
            };
            yield {
              type: 'tool_use_start',
              toolName: event.content_block.name,
            };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            textContent += event.delta.text;
            yield {
              type: 'text',
              content: event.delta.text,
            };
          } else if (event.delta.type === 'input_json_delta' && currentToolUse) {
            currentToolUse.input += event.delta.partial_json;
          }
        } else if (event.type === 'content_block_stop') {
          if (currentToolUse) {
            try {
              const input = JSON.parse(currentToolUse.input || '{}');
              toolUseBlocks.push({
                type: 'tool_use',
                id: currentToolUse.id,
                name: currentToolUse.name,
                input,
              });
            } catch (e) {
              this.logger.error(`Failed to parse tool input: ${currentToolUse.input}`);
            }
            currentToolUse = null;
          }
        }
      }

      const finalMessage = await stream.finalMessage();

      // If no tool calls, we're done
      if (toolUseBlocks.length === 0) {
        continueLoop = false;
        yield { type: 'complete' };
        break;
      }

      // Add assistant message to conversation
      messages.push({
        role: 'assistant',
        content: finalMessage.content as any,
      });

      // Execute tools
      const toolResults: Array<{
        type: 'tool_result';
        tool_use_id: string;
        content: string;
      }> = [];

      for (const toolUse of toolUseBlocks) {
        this.logger.log(`Executing tool: ${toolUse.name}`);
        const result = await this.toolExecutor.execute(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
        );

        yield {
          type: 'tool_result',
          toolName: toolUse.name,
          toolInput: toolUse.input as Record<string, unknown>,
          toolResult: result.data || result.error,
        };

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result.success ? result.data : { error: result.error }),
        });
      }

      // Add tool results
      messages.push({
        role: 'user',
        content: toolResults as any,
      });

      if (finalMessage.stop_reason === 'end_turn') {
        continueLoop = false;
        yield { type: 'complete' };
      }
    }
  }
}
