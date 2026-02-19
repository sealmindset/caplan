import { Injectable, Logger } from '@nestjs/common';
import { JiraService } from '../integrations/jira/jira.service';
import { TempoService } from '../integrations/tempo/tempo.service';
import { FieldMappingService } from './field-mapping.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly jiraService: JiraService,
    private readonly tempoService: TempoService,
    private readonly fieldMappingService: FieldMappingService,
  ) {}

  /**
   * Test Jira connection with provided credentials
   */
  async testJiraConnection(credentials: { baseUrl: string; email: string; apiToken: string }) {
    try {
      // Temporarily update connection for testing
      await this.jiraService.updateConnection(credentials.baseUrl, credentials.email, credentials.apiToken);
      return await this.jiraService.testConnection();
    } catch (error) {
      this.logger.error('Jira connection test failed', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Test Tempo connection with provided credentials
   */
  async testTempoConnection(credentials: { apiToken: string }) {
    try {
      // Temporarily update connection for testing
      await this.tempoService.updateConnection(credentials.apiToken);
      return await this.tempoService.testConnection();
    } catch (error) {
      this.logger.error('Tempo connection test failed', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Save Jira connection settings
   * TODO: Store credentials securely (encrypted in database or secret manager)
   */
  async saveJiraConnection(credentials: { baseUrl: string; email: string; apiToken: string }) {
    try {
      await this.jiraService.updateConnection(credentials.baseUrl, credentials.email, credentials.apiToken);

      // TODO: Save to database or configuration store
      // For now, we're just updating the service instance
      // In production, you should:
      // 1. Encrypt the credentials
      // 2. Store in database
      // 3. Update environment variables or configuration

      this.logger.log('Jira connection settings saved');
      return { success: true, message: 'Jira connection configured successfully' };
    } catch (error) {
      this.logger.error('Failed to save Jira connection', error);
      throw error;
    }
  }

  /**
   * Save Tempo connection settings
   * TODO: Store credentials securely (encrypted in database or secret manager)
   */
  async saveTempoConnection(credentials: { apiToken: string }) {
    try {
      await this.tempoService.updateConnection(credentials.apiToken);

      // TODO: Save to database or configuration store
      // Same considerations as Jira above

      this.logger.log('Tempo connection settings saved');
      return { success: true, message: 'Tempo connection configured successfully' };
    } catch (error) {
      this.logger.error('Failed to save Tempo connection', error);
      throw error;
    }
  }

  /**
   * Get connection status for all integrations
   */
  async getConnectionStatus() {
    const jiraStatus = await this.jiraService.testConnection();
    const tempoStatus = await this.tempoService.testConnection();

    return {
      jira: jiraStatus,
      tempo: tempoStatus,
    };
  }

  /**
   * Get all field mappings
   */
  async getFieldMappings() {
    return this.fieldMappingService.getAllMappings();
  }

  /**
   * Update field mappings
   */
  async updateFieldMappings(mappings: any) {
    return this.fieldMappingService.updateMappings(mappings);
  }

  /**
   * Get field mapping for specific entity
   */
  async getEntityMapping(entity: string) {
    return this.fieldMappingService.getEntityMapping(entity);
  }

  /**
   * Sync data from Jira
   */
  async syncFromJira() {
    return await this.jiraService.syncFromJira();
  }

  /**
   * Sync data to Jira
   */
  async syncToJira(data: any) {
    return await this.jiraService.syncToJira(data);
  }

  /**
   * Sync data from Tempo
   */
  async syncFromTempo() {
    return await this.tempoService.syncFromTempo();
  }

  /**
   * Sync data to Tempo
   */
  async syncToTempo(data: any) {
    return await this.tempoService.syncToTempo(data);
  }

  /**
   * Get sync history
   * TODO: Implement sync logging and history tracking
   */
  async getSyncHistory() {
    // TODO: Retrieve from database
    return {
      history: [
        // Example format
        // { id: 1, type: 'jira-pull', timestamp: '2026-02-06T...',  status: 'success', recordsSynced: 10 },
      ],
    };
  }

  /**
   * Get projects from Jira filtered by specific project IDs
   *
   * Filters projects based on JIRA_PROJECT_IDS environment variable.
   * Set JIRA_PROJECT_IDS as a comma-separated list (e.g., "10162,10163,10164")
   * If not set, returns all projects.
   */
  async getProjects() {
    try {
      // Fetch all projects from Jira
      const allProjects = await this.jiraService.getProjects();

      // Read project IDs from environment variable
      const projectIdsEnv = process.env.JIRA_PROJECT_IDS || '';
      const targetProjectIds = projectIdsEnv
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      this.logger.log(`Fetched ${allProjects.length} projects from Jira`);
      if (targetProjectIds.length > 0) {
        this.logger.log(`Filtering by project IDs: ${targetProjectIds.join(', ')}`);
      }

      // If specific project IDs are configured, filter by them
      // Otherwise, return all projects
      const filteredProjects = targetProjectIds.length > 0
        ? allProjects.filter(project => targetProjectIds.includes(project.id))
        : allProjects;

      this.logger.log(`Returning ${filteredProjects.length} projects`);

      return {
        success: true,
        projects: filteredProjects.map(project => ({
          id: project.id,
          key: project.key,
          name: project.name,
          description: project.description || '',
          lead: project.lead?.displayName || '',
          projectType: project.projectTypeKey || '',
          category: project.projectCategory?.name || '',
        })),
      };
    } catch (error) {
      this.logger.error('Failed to fetch projects from Jira', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch projects',
        projects: [],
      };
    }
  }

  /**
   * Get epics for a specific project
   */
  async getProjectEpics(projectKey: string, initiativeOnly = false) {
    try {
      const epics = await this.jiraService.getEpics(projectKey, initiativeOnly);

      this.logger.log(`Mapping ${epics.length} epics/initiatives for response`);

      // Get all custom field IDs from environment
      const itOwnerField = process.env.JIRA_IT_OWNER_FIELD || 'customfield_10150';
      const businessChampionField = process.env.JIRA_BUSINESS_CHAMPION_FIELD || 'customfield_10078';
      const workstreamField = process.env.JIRA_WORKSTREAM_FIELD || 'customfield_10447';
      const inserviceDateField = process.env.JIRA_INSERVICE_DATE_FIELD || 'customfield_10121';
      const startDateField = process.env.JIRA_START_DATE_FIELD || 'customfield_10015';
      const endDateField = process.env.JIRA_END_DATE_FIELD || 'customfield_10685';
      const parField = process.env.JIRA_PAR_FIELD || 'customfield_10132';
      const healthStatusField = process.env.JIRA_HEALTH_STATUS_FIELD || 'customfield_10451';
      const businessValueField = process.env.JIRA_BUSINESS_VALUE_FIELD || 'customfield_10200';
      const capitalExpenseField = process.env.JIRA_CAPITAL_EXPENSE_FIELD || 'customfield_10450';

      return {
        success: true,
        projectKey,
        initiativeOnly,
        count: epics.length,
        epics: epics.map(epic => {
          // IT Owner(s) is a multi-user picker (array of user objects)
          // Extract display names and join with comma
          let owner = '';
          const itOwners = epic.fields?.[itOwnerField];

          if (Array.isArray(itOwners) && itOwners.length > 0) {
            owner = itOwners.map(user => user.displayName).join(', ');
          } else if (!itOwners) {
            // Fall back to assignee if no IT Owner is set
            owner = epic.fields?.assignee?.displayName || '';
          }

          // Business Champion(s) is a multi-user picker (array of user objects)
          let businessOwner = '';
          const businessChampions = epic.fields?.[businessChampionField];

          if (Array.isArray(businessChampions) && businessChampions.length > 0) {
            businessOwner = businessChampions.map(user => user.displayName).join(', ');
          }

          // Workstream is a single select field (object with value property)
          const workstream = epic.fields?.[workstreamField]?.value || '';

          // Date fields (date pickers return date strings)
          const inserviceDate = epic.fields?.[inserviceDateField] || null;
          const startDate = epic.fields?.[startDateField] || null;
          const endDate = epic.fields?.[endDateField] || null;

          // PAR # is a text field
          const par = epic.fields?.[parField] || '';

          // Health Status is a single select field (object with value property)
          // Values: Green, Yellow, Red
          const healthStatus = epic.fields?.[healthStatusField]?.value || '';

          // Business Value is a paragraph field (ADF format)
          // Extract plain text from ADF content
          let businessValue = '';
          const businessValueData = epic.fields?.[businessValueField];
          if (businessValueData && businessValueData.content) {
            businessValue = businessValueData.content
              .map(node => {
                if (node.type === 'paragraph' && node.content) {
                  return node.content.map(textNode => textNode.text || '').join('');
                }
                return '';
              })
              .join('\n')
              .trim();
          }

          // Capital/Expense is a single select field (object with value property)
          const capitalExpense = epic.fields?.[capitalExpenseField]?.value || '';

          return {
            id: epic.id,
            key: epic.key,
            summary: epic.fields?.summary || '',
            description: epic.fields?.description || '',
            status: epic.fields?.status?.name || '',
            assignee: epic.fields?.assignee?.displayName || '',
            owner, // IT Owner(s) field mapped to owner
            businessOwner, // Business Champion(s) field mapped to businessOwner
            workstream, // Workstream field
            inserviceDate, // In-service Date (Go Live) field
            startDate, // Start Date field
            endDate, // End Date field
            par, // PAR # field
            healthStatus, // Health Status field (Green/Yellow/Red)
            businessValue, // Business Value field (extracted from ADF)
            capitalExpense, // Capital/Expense field
            priority: epic.fields?.priority?.name || '',
            created: epic.fields?.created || null,
            updated: epic.fields?.updated || null,
            duedate: epic.fields?.duedate || null,
            labels: epic.fields?.labels || [],
            issueType: epic.fields?.issuetype?.name || '',
          };
        }),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch epics for project ${projectKey}:`, error.message);
      if (error.stack) {
        this.logger.error('Stack trace:', error.stack);
      }
      return {
        success: false,
        projectKey,
        message: error.message || 'Failed to fetch epics',
        error: error.toString(),
        epics: [],
      };
    }
  }

  /**
   * Update IT Owner for an epic/initiative
   */
  async updateEpicOwner(issueKey: string, ownerName: string, projectKey: string) {
    try {
      await this.jiraService.updateITOwner(issueKey, ownerName, projectKey);
      return {
        success: true,
        message: `IT Owner updated successfully for ${issueKey}`,
      };
    } catch (error) {
      this.logger.error(`Failed to update IT Owner for ${issueKey}:`, error.message);
      return {
        success: false,
        message: error.message || 'Failed to update IT Owner',
      };
    }
  }

  /**
   * Update multiple fields for an epic/initiative
   */
  async updateEpicFields(issueKey: string, fields: {
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
  }) {
    try {
      await this.jiraService.updateEpicFields(issueKey, fields);
      return {
        success: true,
        message: `Epic fields updated successfully for ${issueKey}`,
      };
    } catch (error) {
      this.logger.error(`Failed to update epic fields for ${issueKey}:`, error.message);
      return {
        success: false,
        message: error.message || 'Failed to update epic fields',
      };
    }
  }

  /**
   * Get project details including issue types
   */
  async getProjectDetails(projectKey: string) {
    try {
      const project = await this.jiraService.getProject(projectKey);

      return {
        success: true,
        project: {
          id: project.id,
          key: project.key,
          name: project.name,
          issueTypes: project.issueTypes?.map(type => ({
            id: type.id,
            name: type.name,
            subtask: type.subtask,
            hierarchyLevel: type.hierarchyLevel || null,
          })) || [],
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch project details for ${projectKey}`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch project details',
      };
    }
  }

  /**
   * Get users for IT Owner selection
   * Returns all active users in Jira, not just project-assignable users
   */
  async getProjectUsers(projectKey: string) {
    try {
      // Use getAllActiveUsers instead of getProjectUsers to include all users
      // that can be IT Owners, not just assignable users
      const users = await this.jiraService.getAllActiveUsers();

      return {
        success: true,
        users: users.map(user => ({
          accountId: user.accountId,
          displayName: user.displayName,
          emailAddress: user.emailAddress,
          active: user.active,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch users for project ${projectKey}`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch users',
        users: [],
      };
    }
  }

  /**
   * Get available transitions for an issue
   */
  async getAvailableTransitions(issueKey: string) {
    try {
      const transitions = await this.jiraService.getAvailableTransitions(issueKey);
      return {
        success: true,
        issueKey,
        transitions: transitions.map(t => ({
          id: t.id,
          name: t.name,
          to: {
            id: t.to?.id,
            name: t.to?.name,
          },
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get transitions for ${issueKey}`, error);
      return {
        success: false,
        message: error.message || 'Failed to get transitions',
        transitions: [],
      };
    }
  }

  /**
   * Transition an issue to a new status
   */
  async transitionIssue(issueKey: string, targetStatus: string, additionalFields?: any) {
    try {
      await this.jiraService.transitionIssue(issueKey, targetStatus, additionalFields);
      return {
        success: true,
        message: `Successfully transitioned ${issueKey} to "${targetStatus}"`,
      };
    } catch (error) {
      this.logger.error(`Failed to transition ${issueKey} to ${targetStatus}`, error);
      return {
        success: false,
        message: error.message || 'Failed to transition issue',
      };
    }
  }

  /**
   * Get field metadata including allowed values for select fields
   */
  async getFieldMetadata(projectKey: string) {
    try {
      const metadata = await this.jiraService.getFieldMetadata(projectKey);
      return {
        success: true,
        projectKey,
        fields: metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get field metadata for ${projectKey}`, error);
      return {
        success: false,
        message: error.message || 'Failed to get field metadata',
        fields: {},
      };
    }
  }
}
