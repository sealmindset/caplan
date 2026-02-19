import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health/live')
  getLiveness(): { status: string } {
    return { status: 'ok' };
  }

  @Get('health/ready')
  getReadiness(): { status: string } {
    return { status: 'ok' };
  }

  @Get('health')
  getLegacyHealth(): { status: string } {
    return { status: 'ok' };
  }
}
