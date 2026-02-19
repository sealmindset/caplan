import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

interface ServiceStatus {
  name: string;
  type: 'mock' | 'live';
  url: string;
  connected: boolean;
}

interface SystemStatus {
  environment: string;
  usingMockServers: boolean;
  services: {
    jira: ServiceStatus;
    tempo: ServiceStatus;
  };
}

@Controller('status')
export class StatusController {
  @Get()
  @Public()
  getStatus(): SystemStatus {
    const jiraUrl = process.env.JIRA_BASE_URL || '';
    const tempoUrl = process.env.TEMPO_API_URL || 'https://api.tempo.io/4';

    const isJiraMock = jiraUrl.includes('mock') || jiraUrl.includes('8443') || jiraUrl.includes('localhost:8443');
    const isTempoMock = tempoUrl.includes('mock') || tempoUrl.includes('8444') || tempoUrl.includes('localhost:8444');

    return {
      environment: process.env.NODE_ENV || 'development',
      usingMockServers: isJiraMock || isTempoMock,
      services: {
        jira: {
          name: 'Jira',
          type: isJiraMock ? 'mock' : 'live',
          url: this.sanitizeUrl(jiraUrl),
          connected: !!jiraUrl,
        },
        tempo: {
          name: 'Tempo',
          type: isTempoMock ? 'mock' : 'live',
          url: this.sanitizeUrl(tempoUrl),
          connected: !!process.env.TEMPO_API_TOKEN,
        },
      },
    };
  }

  private sanitizeUrl(url: string): string {
    // Remove sensitive parts, just show host
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return url.split('/').slice(0, 3).join('/');
    }
  }
}
