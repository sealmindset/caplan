import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles, AppRole } from '../auth';

@Controller('admin')
@Roles(AppRole.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Test Jira connection
   */
  @Post('connections/jira/test')
  async testJiraConnection(@Body() credentials: { baseUrl: string; email: string; apiToken: string }) {
    return this.adminService.testJiraConnection(credentials);
  }

  /**
   * Test Tempo connection
   */
  @Post('connections/tempo/test')
  async testTempoConnection(@Body() credentials: { apiToken: string }) {
    return this.adminService.testTempoConnection(credentials);
  }

  /**
   * Save Jira connection settings
   */
  @Post('connections/jira')
  async saveJiraConnection(@Body() credentials: { baseUrl: string; email: string; apiToken: string }) {
    return this.adminService.saveJiraConnection(credentials);
  }

  /**
   * Save Tempo connection settings
   */
  @Post('connections/tempo')
  async saveTempoConnection(@Body() credentials: { apiToken: string }) {
    return this.adminService.saveTempoConnection(credentials);
  }

  /**
   * Get connection status for all integrations
   */
  @Get('connections/status')
  async getConnectionStatus() {
    return this.adminService.getConnectionStatus();
  }

  /**
   * Get all field mappings
   */
  @Get('mappings')
  async getFieldMappings() {
    return this.adminService.getFieldMappings();
  }

  /**
   * Update field mappings
   */
  @Put('mappings')
  async updateFieldMappings(@Body() mappings: any) {
    return this.adminService.updateFieldMappings(mappings);
  }

  /**
   * Get field mapping for specific entity
   */
  @Get('mappings/:entity')
  async getEntityMapping(@Param('entity') entity: string) {
    return this.adminService.getEntityMapping(entity);
  }

  /**
   * Trigger manual sync from Jira
   */
  @Post('sync/jira/pull')
  async syncFromJira() {
    return this.adminService.syncFromJira();
  }

  /**
   * Trigger manual sync to Jira
   */
  @Post('sync/jira/push')
  async syncToJira(@Body() data: any) {
    return this.adminService.syncToJira(data);
  }

  /**
   * Trigger manual sync from Tempo
   */
  @Post('sync/tempo/pull')
  async syncFromTempo() {
    return this.adminService.syncFromTempo();
  }

  /**
   * Trigger manual sync to Tempo
   */
  @Post('sync/tempo/push')
  async syncToTempo(@Body() data: any) {
    return this.adminService.syncToTempo(data);
  }

  /**
   * Get sync history/logs
   */
  @Get('sync/history')
  async getSyncHistory() {
    return this.adminService.getSyncHistory();
  }

  /**
   * Get projects from Jira
   */
  @Get('projects')
  async getProjects() {
    return this.adminService.getProjects();
  }

  /**
   * Get epics for a specific project
   */
  @Get('projects/:projectKey/epics')
  async getProjectEpics(
    @Param('projectKey') projectKey: string,
    @Query('initiativeOnly') initiativeOnly?: string,
  ) {
    const initiativeFilter = initiativeOnly === 'true';
    return this.adminService.getProjectEpics(projectKey, initiativeFilter);
  }

  /**
   * Get project details including issue types
   */
  @Get('projects/:projectKey/details')
  async getProjectDetails(@Param('projectKey') projectKey: string) {
    return this.adminService.getProjectDetails(projectKey);
  }

  /**
   * Update IT Owner for an epic/initiative
   */
  @Put('epics/:issueKey/owner')
  async updateEpicOwner(
    @Param('issueKey') issueKey: string,
    @Body() body: { owner: string; projectKey: string },
  ) {
    return this.adminService.updateEpicOwner(issueKey, body.owner, body.projectKey);
  }

  /**
   * Update multiple fields for an epic/initiative
   */
  @Put('epics/:issueKey/fields')
  async updateEpicFields(
    @Param('issueKey') issueKey: string,
    @Body() fields: {
      owner?: string;
      businessOwner?: string;
      workstream?: string;
      par?: string;
      startDate?: string;
      endDate?: string;
      inserviceDate?: string;
      description?: string;
      healthStatus?: string;
      businessValue?: string;
      capitalExpense?: string;
    },
  ) {
    return this.adminService.updateEpicFields(issueKey, fields);
  }

  /**
   * Get assignable users for a project
   */
  @Get('projects/:projectKey/users')
  async getProjectUsers(@Param('projectKey') projectKey: string) {
    return this.adminService.getProjectUsers(projectKey);
  }

  /**
   * Get available transitions for an issue
   */
  @Get('issues/:issueKey/transitions')
  async getTransitions(@Param('issueKey') issueKey: string) {
    return this.adminService.getAvailableTransitions(issueKey);
  }

  /**
   * Transition an issue to a new status
   */
  @Post('issues/:issueKey/transition')
  async transitionIssue(
    @Param('issueKey') issueKey: string,
    @Body() body: { targetStatus: string; additionalFields?: any }
  ) {
    return this.adminService.transitionIssue(issueKey, body.targetStatus, body.additionalFields);
  }

  /**
   * Get field metadata for validation (select field options)
   */
  @Get('projects/:projectKey/field-metadata')
  async getFieldMetadata(@Param('projectKey') projectKey: string) {
    return this.adminService.getFieldMetadata(projectKey);
  }
}
