import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FieldMappingService } from './field-mapping.service';
import { JiraModule } from '../integrations/jira/jira.module';
import { TempoModule } from '../integrations/tempo/tempo.module';

@Module({
  imports: [JiraModule, TempoModule],
  controllers: [AdminController],
  providers: [AdminService, FieldMappingService],
  exports: [AdminService, FieldMappingService],
})
export class AdminModule {}
