'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
  isStreaming?: boolean;
}

export interface AIInsight {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  metric?: {
    value: number;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
  };
  recommendation?: string;
  timestamp: Date;
}

interface AIContextType {
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;
  insights: AIInsight[];
  isInsightsLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  refreshInsights: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/query/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          conversationId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      const toolCalls: Message['toolCalls'] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'text' && data.content) {
                  fullContent += data.content;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                } else if (data.type === 'tool_use_start') {
                  // Show tool being used
                  fullContent += `\n*Using tool: ${data.toolName}...*\n`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                } else if (data.type === 'tool_result') {
                  toolCalls.push({
                    name: data.toolName,
                    input: data.toolInput,
                  });
                  // Remove tool indicator
                  fullContent = fullContent.replace(`\n*Using tool: ${data.toolName}...*\n`, '');
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                } else if (data.type === 'error') {
                  fullContent += `\n\nError: ${data.error}`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullContent, isStreaming: false }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Finalize message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: fullContent,
                isStreaming: false,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
              }
            : msg
        )
      );

      // Extract conversation ID from response if not set
      if (!conversationId) {
        // The conversation ID is managed server-side
        // For simplicity, we'll let the server manage it
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const refreshInsights = useCallback(async () => {
    setIsInsightsLoading(true);
    try {
      const response = await fetch('/api/ai/insights/dashboard');
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsInsightsLoading(false);
    }
  }, []);

  return (
    <AIContext.Provider
      value={{
        messages,
        isLoading,
        conversationId,
        insights,
        isInsightsLoading,
        sendMessage,
        clearConversation,
        refreshInsights,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
