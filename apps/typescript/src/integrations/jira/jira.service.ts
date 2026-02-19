import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

/**
 * Jira Cloud API Integration Service
 * Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#about
 */
@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);
  private axiosInstance: AxiosInstance;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize Jira API client with authentication
   *
   * TODO: Add your Jira credentials here or load from environment/config
   *
   * REQUIRED CREDENTIALS:
   * - jiraBaseUrl: Your Jira instance URL (e.g., https://your-domain.atlassian.net)
   * - email: Your Atlassian account email
   * - apiToken: Generate from https://id.atlassian.com/manage-profile/security/api-tokens
   */
  private initializeClient() {
    // TODO: Replace with your actual credentials or load from config service
    const jiraBaseUrl = process.env.JIRA_BASE_URL || 'https://sntech.atlassian.net';
    const email = process.env.JIRA_EMAIL || ''; // TODO: Add your email
    const apiToken = process.env.JIRA_API_TOKEN || ''; // TODO: Add your API token

    if (!email || !apiToken) {
      this.logger.warn('Jira credentials not configured. API calls will fail.');
    }

    this.axiosInstance = axios.create({
      baseURL: `${jiraBaseUrl}/rest/api/3`,
      auth: {
        username: email,
        password: apiToken,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Update Jira connection settings
   */
  async updateConnection(baseUrl: string, email: string, apiToken: string) {
    this.axiosInstance = axios.create({
      baseURL: `${baseUrl}/rest/api/3`,
      auth: {
        username: email,
        password: apiToken,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('Jira connection settings updated');
  }

  /**
   * Test the Jira connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.axiosInstance.get('/myself');
      return {
        success: true,
        message: `Connected as ${response.data.displayName}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Get all projects from Jira with pagination
   * Uses v2 API search endpoint to fetch ALL projects
   */
  async getProjects(): Promise<any[]> {
    try {
      // Use v2 API for project search endpoint with pagination
      const baseUrl = this.axiosInstance.defaults.baseURL.replace('/rest/api/3', '');
      this.logger.log(`Fetching projects from: ${baseUrl}/rest/api/2/project/search`);
      this.logger.log(`Using credentials: ${this.axiosInstance.defaults.auth?.username ? 'configured' : 'missing'}`);

      // Paginate through all results to fetch ALL projects
      let allProjects = [];
      let startAt = 0;
      const maxResults = 500; // Increased for better performance with large datasets
      let isLast = false;

      do {
        const url = `${baseUrl}/rest/api/2/project/search`;
        const response = await this.axiosInstance.get(url, {
          params: {
            startAt,
            maxResults,
          },
        });

        const projects = response.data.values || [];
        allProjects = allProjects.concat(projects);
        isLast = response.data.isLast;
        startAt += maxResults;

        this.logger.log(`Fetched ${projects.length} projects (total so far: ${allProjects.length}, isLast: ${isLast})`);

        // Continue until we've fetched all projects
      } while (!isLast);

      this.logger.log(`Fetched ALL ${allProjects.length} projects from Jira`);
      return allProjects;
    } catch (error) {
      this.logger.error('Failed to fetch projects from Jira', error.message);
      this.logger.error('Error details:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get project details by key
   */
  async getProject(projectKey: string): Promise<any> {
    try {
      const baseUrl = this.axiosInstance.defaults.baseURL.replace('/rest/api/3', '');
      const response = await this.axiosInstance.get(`${baseUrl}/rest/api/2/project/${projectKey}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch project ${projectKey}`, error);
      throw error;
    }
  }

  /**
   * Search issues using JQL
   */
  async searchIssues(jql: string, maxResults = 50, startAt = 0): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/search', {
        jql,
        maxResults,
        startAt,
        fields: ['summary', 'status', 'assignee', 'priority', 'created', 'updated'],
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to search issues', error);
      throw error;
    }
  }

  /**
   * Get epics for a specific project
   * @param projectKey - The Jira project key (e.g., 'ITPM', 'RD', 'PROD')
   * @param initiativeOnly - If true, only return initiative-level issues
   */
  async getEpics(projectKey: string, initiativeOnly = false): Promise<any[]> {
    try {
      // Fetch project details to get actual issue type IDs
      const project = await this.getProject(projectKey);

      // Find Epic and Initiative issue types by name
      const epicIssueType = project.issueTypes?.find(t =>
        t.name.toLowerCase() === 'epic'
      );
      const initiativeIssueType = project.issueTypes?.find(t =>
        t.name.toLowerCase() === 'initiative'
      );

      // Fallback to environment variables if issue types not found by name
      const epicIssueTypeId = epicIssueType?.id || process.env.JIRA_EPIC_ISSUE_TYPE_ID || '10000';
      const initiativeIssueTypeId = initiativeIssueType?.id || process.env.JIRA_INITIATIVE_ISSUE_TYPE_ID || '10001';

      this.logger.log(`Found issue types - Epic: ${epicIssueTypeId}, Initiative: ${initiativeIssueTypeId}`);

      // JQL to get issues using issue type IDs (safer than names which can vary)
      let jql: string;

      if (initiativeOnly) {
        // Get only Initiative-level issues
        // Order by key DESC to ensure stable pagination (unique, deterministic ordering)
        jql = `project = ${projectKey} AND issuetype = ${initiativeIssueTypeId} ORDER BY key DESC`;
      } else {
        // Get both Initiatives and Epics
        // Order by key DESC to ensure stable pagination (unique, deterministic ordering)
        jql = `project = ${projectKey} AND issuetype in (${epicIssueTypeId}, ${initiativeIssueTypeId}) ORDER BY key DESC`;
      }

      this.logger.log(`Fetching epics with JQL: ${jql}`);

      // Get custom field IDs from environment
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

      // Build fields list including all custom fields
      const fields = [
        'summary',
        'description',
        'status',
        'assignee',
        'priority',
        'created',
        'updated',
        'duedate',
        'labels',
        'parent',
        'issuetype',
        itOwnerField,
        businessChampionField,
        workstreamField,
        inserviceDateField,
        startDateField,
        endDateField,
        parField,
        healthStatusField,
        businessValueField,
        capitalExpenseField,
      ].join(',');

      // Paginate through all results to fetch ALL items
      let allIssues = [];
      let startAt = 0;
      const maxResults = 100;
      let total = 0;
      const seenIssueKeys = new Set();

      do {
        // Use v3 API GET /search/jql endpoint with query parameters
        // Note: ORDER BY key DESC ensures stable pagination (unique ordering)
        const response = await this.axiosInstance.get('/search/jql', {
          params: {
            jql,
            maxResults,
            startAt,
            fields,
          },
        });

        const issues = response.data.issues || [];
        const fetchedCount = issues.length;
        total = response.data.total || total;

        this.logger.log(`Search response status: ${response.status}, fetched ${fetchedCount} issues (startAt: ${startAt}, total: ${total})`);

        // Log first and last issue keys for debugging
        if (issues.length > 0) {
          const issueKeys = issues.map(i => i.key);
          this.logger.log(`Issue keys on this page: first=${issueKeys[0]}, last=${issueKeys[issueKeys.length - 1]}, sample=${issueKeys.slice(0, 5).join(', ')}`);
        }

        // Check for duplicate issues (indicates we've hit the end)
        let newIssuesCount = 0;
        let duplicateCount = 0;
        for (const issue of issues) {
          if (!seenIssueKeys.has(issue.key)) {
            seenIssueKeys.add(issue.key);
            allIssues.push(issue);
            newIssuesCount++;
          } else {
            duplicateCount++;
          }
        }

        this.logger.log(`Added ${newIssuesCount} new issues, ${duplicateCount} duplicates (${allIssues.length} total unique issues)`);

        startAt += maxResults;

        // Stop if:
        // 1. We got fewer results than requested, OR
        // 2. We got no new unique issues (all duplicates), OR
        // 3. We have a total and reached it
        if (fetchedCount < maxResults || newIssuesCount === 0 || (total > 0 && allIssues.length >= total)) {
          this.logger.log(`Pagination complete: fetched ${allIssues.length} unique issues (total from API: ${total})`);
          break;
        }
      } while (true);

      this.logger.log(`Fetched ALL ${allIssues.length} epics/initiatives for project ${projectKey}`);
      return allIssues;
    } catch (error) {
      this.logger.error(`Failed to fetch epics for project ${projectKey}`, error.message);
      this.logger.error('Error details:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get issue by key
   */
  async getIssue(issueKey: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/issue/${issueKey}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch issue ${issueKey}`, error);
      throw error;
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(issueData: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/issue', issueData);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create issue', error);
      throw error;
    }
  }

  /**
   * Update an existing issue
   */
  async updateIssue(issueKey: string, updateData: any): Promise<void> {
    try {
      await this.axiosInstance.put(`/issue/${issueKey}`, updateData);
      this.logger.log(`Issue ${issueKey} updated successfully`);
    } catch (error) {
      this.logger.error(`Failed to update issue ${issueKey}`, error);
      throw error;
    }
  }

  /**
   * Convert date to Jira format (YYYY-MM-DD)
   * Handles various input formats and returns ISO date string or null
   */
  private formatDateForJira(dateString: string | null | undefined): string | null {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        this.logger.warn(`Invalid date format: ${dateString}`);
        return null;
      }
      // Return in YYYY-MM-DD format
      return date.toISOString().split('T')[0];
    } catch (error) {
      this.logger.error(`Error formatting date: ${dateString}`, error);
      return null;
    }
  }

  /**
   * Look up multiple users by comma-separated display names
   * Supports multi-user picker fields by splitting comma-separated names
   * @param namesString - Comma-separated list of user display names (e.g., "John Doe, Jane Smith")
   * @returns Array of user objects with accountId for Jira API
   */
  private async lookupMultipleUsers(namesString: string): Promise<Array<{ accountId: string }>> {
    if (!namesString || namesString.trim() === '') {
      return [];
    }

    // Split by comma and trim whitespace
    const names = namesString.split(',').map(name => name.trim()).filter(name => name.length > 0);
    const userObjects: Array<{ accountId: string }> = [];

    for (const name of names) {
      try {
        this.logger.log(`Looking up user: ${name}`);
        const users = await this.searchUserByDisplayName(name);
        const matchedUser = users.find(u => u.displayName === name);

        if (matchedUser) {
          userObjects.push({ accountId: matchedUser.accountId });
          this.logger.log(`Found accountId for ${name}: ${matchedUser.accountId}`);
        } else {
          this.logger.warn(`User "${name}" not found in search results`);
        }
      } catch (error) {
        this.logger.error(`Error looking up user "${name}":`, error);
      }
    }

    return userObjects;
  }

  /**
   * Update multiple fields for an epic/initiative
   * @param issueKey - The Jira issue key (e.g., 'ITPM-123')
   * @param fields - Object containing field updates
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
    businessValue?: string;
    capitalExpense?: string;
    healthStatus?: string;
  }): Promise<void> {
    try {
      const itOwnerField = process.env.JIRA_IT_OWNER_FIELD || 'customfield_10150';
      const businessChampionField = process.env.JIRA_BUSINESS_CHAMPION_FIELD || 'customfield_10078';
      const workstreamField = process.env.JIRA_WORKSTREAM_FIELD || 'customfield_10447';
      const parField = process.env.JIRA_PAR_FIELD || 'customfield_10132';
      const startDateField = process.env.JIRA_START_DATE_FIELD || 'customfield_10015';
      const endDateField = process.env.JIRA_END_DATE_FIELD || 'customfield_10685';
      const inserviceDateField = process.env.JIRA_INSERVICE_DATE_FIELD || 'customfield_10121';
      const healthStatusField = process.env.JIRA_HEALTH_STATUS_FIELD || 'customfield_10451';
      const businessValueField = process.env.JIRA_BUSINESS_VALUE_FIELD || 'customfield_10200';
      const capitalExpenseField = process.env.JIRA_CAPITAL_EXPENSE_FIELD || 'customfield_10450';

      // Validate select fields if values are provided
      // Get project key from issue key (e.g., ITPM-123 -> ITPM)
      const projectKey = issueKey.split('-')[0];

      // Only validate if select field values are provided
      const needsValidation = fields.workstream || fields.healthStatus || fields.capitalExpense;

      if (needsValidation) {
        try {
          const metadata = await this.getFieldMetadata(projectKey);

          // Validate workstream
          if (fields.workstream && metadata.workstream) {
            const isValid = this.validateSelectFieldValue(
              'Workstream',
              fields.workstream,
              metadata.workstream.allowedValues
            );
            if (!isValid) {
              throw new Error(
                `Invalid Workstream value "${fields.workstream}". Allowed values: ${metadata.workstream.allowedValues.join(', ')}`
              );
            }
          }

          // Validate health status
          if (fields.healthStatus && metadata.healthStatus) {
            const isValid = this.validateSelectFieldValue(
              'Health Status',
              fields.healthStatus,
              metadata.healthStatus.allowedValues
            );
            if (!isValid) {
              throw new Error(
                `Invalid Health Status value "${fields.healthStatus}". Allowed values: ${metadata.healthStatus.allowedValues.join(', ')}`
              );
            }
          }

          // Validate capital/expense
          if (fields.capitalExpense && metadata.capitalExpense) {
            const isValid = this.validateSelectFieldValue(
              'Capital/Expense',
              fields.capitalExpense,
              metadata.capitalExpense.allowedValues
            );
            if (!isValid) {
              throw new Error(
                `Invalid Capital/Expense value "${fields.capitalExpense}". Allowed values: ${metadata.capitalExpense.allowedValues.join(', ')}`
              );
            }
          }

          this.logger.log('All select field values validated successfully');
        } catch (error) {
          // If validation fails, log but continue (metadata might not be available)
          if (error.message.includes('Invalid')) {
            throw error; // Re-throw validation errors
          }
          this.logger.warn(`Could not validate select fields: ${error.message}`);
        }
      }

      const updateData: any = { fields: {} };

      // Update IT Owner (multi-user picker - supports comma-separated names)
      if (fields.owner !== undefined && fields.owner !== '') {
        this.logger.log(`Looking up IT Owner(s): ${fields.owner}`);
        const userObjects = await this.lookupMultipleUsers(fields.owner);
        if (userObjects.length > 0) {
          updateData.fields[itOwnerField] = userObjects;
          this.logger.log(`Found ${userObjects.length} IT Owner(s)`);
        } else {
          this.logger.warn(`No IT Owners found for "${fields.owner}"`);
        }
      } else if (fields.owner === '') {
        updateData.fields[itOwnerField] = null;
        this.logger.log('Clearing IT Owner field');
      }

      // Update Business Champion (multi-user picker - supports comma-separated names)
      if (fields.businessOwner !== undefined && fields.businessOwner !== '') {
        this.logger.log(`Looking up Business Champion(s): ${fields.businessOwner}`);
        const userObjects = await this.lookupMultipleUsers(fields.businessOwner);
        if (userObjects.length > 0) {
          updateData.fields[businessChampionField] = userObjects;
          this.logger.log(`Found ${userObjects.length} Business Champion(s)`);
        } else {
          this.logger.warn(`No Business Champions found for "${fields.businessOwner}"`);
        }
      } else if (fields.businessOwner === '') {
        updateData.fields[businessChampionField] = null;
        this.logger.log('Clearing Business Champion field');
      }

      // Update Workstream (single select)
      // Note: Only update if value has changed and is provided
      if (fields.workstream !== undefined && fields.workstream !== '') {
        updateData.fields[workstreamField] = { value: fields.workstream };
      } else if (fields.workstream === '') {
        // Clear the field if empty string is provided
        updateData.fields[workstreamField] = null;
      }

      // Update PAR # (text field)
      if (fields.par !== undefined) {
        updateData.fields[parField] = fields.par || null;
      }

      // Update Start Date (date picker - must be YYYY-MM-DD format)
      if (fields.startDate !== undefined) {
        const formattedDate = this.formatDateForJira(fields.startDate);
        updateData.fields[startDateField] = formattedDate;
        this.logger.log(`Setting Start Date: ${formattedDate || 'null'}`);
      }

      // Update End Date (date picker - must be YYYY-MM-DD format)
      if (fields.endDate !== undefined) {
        const formattedDate = this.formatDateForJira(fields.endDate);
        updateData.fields[endDateField] = formattedDate;
        this.logger.log(`Setting End Date: ${formattedDate || 'null'}`);
      }

      // Update In-service Date (date picker - must be YYYY-MM-DD format)
      if (fields.inserviceDate !== undefined) {
        const formattedDate = this.formatDateForJira(fields.inserviceDate);
        updateData.fields[inserviceDateField] = formattedDate;
        this.logger.log(`Setting In-service Date: ${formattedDate || 'null'}`);
      }

      // Update Health Status (radio buttons - single select)
      // DISABLED: Field not available on Initiative screen
      // if (fields.healthStatus !== undefined && fields.healthStatus !== '') {
      //   updateData.fields[healthStatusField] = { value: fields.healthStatus };
      //   this.logger.log(`Setting Health Status: ${fields.healthStatus}`);
      // } else if (fields.healthStatus === '') {
      //   updateData.fields[healthStatusField] = null;
      //   this.logger.log('Clearing Health Status field');
      // }

      // Update Capital/Expense (select list - single select)
      // DISABLED: Field not available on Initiative screen
      // if (fields.capitalExpense !== undefined && fields.capitalExpense !== '') {
      //   updateData.fields[capitalExpenseField] = { value: fields.capitalExpense };
      //   this.logger.log(`Setting Capital/Expense: ${fields.capitalExpense}`);
      // } else if (fields.capitalExpense === '') {
      //   updateData.fields[capitalExpenseField] = null;
      //   this.logger.log('Clearing Capital/Expense field');
      // }

      // Update Business Value (paragraph field with rich text - uses ADF format)
      // DISABLED: Field not available on Initiative screen
      // if (fields.businessValue !== undefined && fields.businessValue !== '') {
      //   updateData.fields[businessValueField] = {
      //     type: 'doc',
      //     version: 1,
      //     content: [
      //       {
      //         type: 'paragraph',
      //         content: [
      //           {
      //             type: 'text',
      //             text: fields.businessValue
      //           }
      //         ]
      //       }
      //     ]
      //   };
      //   this.logger.log('Setting Business Value in ADF format');
      // } else if (fields.businessValue === '') {
      //   updateData.fields[businessValueField] = null;
      //   this.logger.log('Clearing Business Value field');
      // }

      // Update Description (system field)
      // Note: Jira uses Atlassian Document Format (ADF) for description
      // We need to convert plain text to ADF format
      if (fields.description !== undefined && fields.description !== '') {
        // Convert plain text to ADF format
        updateData.fields.description = {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: fields.description
                }
              ]
            }
          ]
        };
        this.logger.log('Setting description in ADF format');
      } else if (fields.description === '') {
        // Clear the description
        updateData.fields.description = null;
        this.logger.log('Clearing description field');
      }

      this.logger.log(`Updating fields for ${issueKey}:`, JSON.stringify(updateData, null, 2));

      await this.axiosInstance.put(`/issue/${issueKey}`, updateData);
      this.logger.log(`Epic fields updated successfully for ${issueKey}`);
    } catch (error) {
      this.logger.error(`Failed to update epic fields for ${issueKey}`, error);
      this.logger.error('Error details:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Search for users by display name across Jira instance
   * @param query - The user's display name to search for
   */
  async searchUserByDisplayName(query: string): Promise<any[]> {
    try {
      // Use user search API which searches across all users, not just assignable
      const response = await this.axiosInstance.get(`/user/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to search for user: ${query}`, error);
      throw error;
    }
  }

  /**
   * Update the IT Owner field for an issue
   * @param issueKey - The Jira issue key (e.g., 'ITPM-123')
   * @param ownerName - The owner's display name or comma-separated names (will lookup accountIds)
   * @param projectKey - The project key (not currently used, kept for compatibility)
   */
  async updateITOwner(issueKey: string, ownerName: string, projectKey: string): Promise<void> {
    try {
      const itOwnerField = process.env.JIRA_IT_OWNER_FIELD || 'customfield_10150';

      this.logger.log(`Updating IT Owner for ${issueKey} to: ${ownerName}`);

      // Use the multi-user lookup helper
      const userObjects = await this.lookupMultipleUsers(ownerName);

      if (userObjects.length === 0) {
        throw new Error(`No users found for "${ownerName}"`);
      }

      // IT Owner(s) is a multi-user picker, so we send an array
      const updateData = {
        fields: {
          [itOwnerField]: userObjects,
        },
      };

      await this.axiosInstance.put(`/issue/${issueKey}`, updateData);
      this.logger.log(`IT Owner updated successfully for ${issueKey} with ${userObjects.length} user(s)`);
    } catch (error) {
      this.logger.error(`Failed to update IT Owner for ${issueKey}`, error);
      this.logger.error('Error details:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get available transitions for an issue
   * @param issueKey - The Jira issue key (e.g., 'ITPM-123')
   * @returns Array of available transitions with their IDs and target statuses
   */
  async getAvailableTransitions(issueKey: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/issue/${issueKey}/transitions`);
      return response.data.transitions || [];
    } catch (error) {
      this.logger.error(`Failed to get transitions for ${issueKey}`, error);
      throw error;
    }
  }

  /**
   * Find transition ID by target status name
   * @param issueKey - The Jira issue key
   * @param targetStatusName - The desired status name (e.g., 'Discovery', 'Done')
   * @returns Transition ID or null if not found
   */
  async findTransitionByTargetStatus(issueKey: string, targetStatusName: string): Promise<string | null> {
    try {
      const transitions = await this.getAvailableTransitions(issueKey);
      const normalizedTarget = targetStatusName.toLowerCase().trim();

      const transition = transitions.find(t =>
        t.to?.name?.toLowerCase().trim() === normalizedTarget
      );

      if (transition) {
        this.logger.log(`Found transition ID ${transition.id} for status "${targetStatusName}"`);
        return transition.id;
      }

      this.logger.warn(`No transition found to status "${targetStatusName}". Available transitions: ${transitions.map(t => t.to?.name).join(', ')}`);
      return null;
    } catch (error) {
      this.logger.error(`Failed to find transition for ${issueKey} to status ${targetStatusName}`, error);
      throw error;
    }
  }

  /**
   * Transition an issue to a new status
   * @param issueKey - The Jira issue key
   * @param targetStatusName - The desired status name
   * @param additionalFields - Optional fields to update during transition
   */
  async transitionIssue(issueKey: string, targetStatusName: string, additionalFields?: any): Promise<void> {
    try {
      // Find the transition ID
      const transitionId = await this.findTransitionByTargetStatus(issueKey, targetStatusName);

      if (!transitionId) {
        throw new Error(`Cannot transition ${issueKey} to status "${targetStatusName}". No valid transition found.`);
      }

      const transitionData: any = {
        transition: { id: transitionId }
      };

      // Add any additional fields to update during transition
      if (additionalFields && Object.keys(additionalFields).length > 0) {
        transitionData.fields = additionalFields;
        this.logger.log(`Transitioning ${issueKey} with additional fields`);
      }

      await this.axiosInstance.post(`/issue/${issueKey}/transitions`, transitionData);
      this.logger.log(`Successfully transitioned ${issueKey} to "${targetStatusName}"`);
    } catch (error) {
      this.logger.error(`Failed to transition ${issueKey} to status "${targetStatusName}"`, error);
      this.logger.error('Error details:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get field metadata including allowed values for select fields
   * This helps validate field values before sending to Jira
   */
  async getFieldMetadata(projectKey: string): Promise<any> {
    try {
      // Get project details to find issue types
      const project = await this.getProject(projectKey);

      // Find Initiative issue type
      const initiativeIssueType = project.issueTypes?.find(t =>
        t.name.toLowerCase() === 'initiative'
      );

      if (!initiativeIssueType) {
        this.logger.warn(`Initiative issue type not found for project ${projectKey}`);
        return {};
      }

      // Get createmeta with field information
      const response = await this.axiosInstance.get('/issue/createmeta', {
        params: {
          projectKeys: projectKey,
          issuetypeIds: initiativeIssueType.id,
          expand: 'projects.issuetypes.fields',
        },
      });

      const projectData = response.data.projects?.[0];
      const issueTypeData = projectData?.issuetypes?.[0];
      const fields = issueTypeData?.fields || {};

      // Extract relevant field metadata
      const workstreamField = process.env.JIRA_WORKSTREAM_FIELD || 'customfield_10447';
      const healthStatusField = process.env.JIRA_HEALTH_STATUS_FIELD || 'customfield_10451';
      const capitalExpenseField = process.env.JIRA_CAPITAL_EXPENSE_FIELD || 'customfield_10450';

      const metadata: any = {};

      // Workstream field options
      if (fields[workstreamField]?.allowedValues) {
        metadata.workstream = {
          fieldId: workstreamField,
          name: fields[workstreamField].name,
          allowedValues: fields[workstreamField].allowedValues.map((v: any) => v.value),
        };
      }

      // Health Status field options
      if (fields[healthStatusField]?.allowedValues) {
        metadata.healthStatus = {
          fieldId: healthStatusField,
          name: fields[healthStatusField].name,
          allowedValues: fields[healthStatusField].allowedValues.map((v: any) => v.value),
        };
      }

      // Capital/Expense field options
      if (fields[capitalExpenseField]?.allowedValues) {
        metadata.capitalExpense = {
          fieldId: capitalExpenseField,
          name: fields[capitalExpenseField].name,
          allowedValues: fields[capitalExpenseField].allowedValues.map((v: any) => v.value),
        };
      }

      this.logger.log(`Retrieved field metadata for project ${projectKey}`);
      return metadata;
    } catch (error) {
      this.logger.error(`Failed to get field metadata for ${projectKey}`, error);
      throw error;
    }
  }

  /**
   * Validate select field value against allowed values
   */
  validateSelectFieldValue(fieldName: string, value: string, allowedValues: string[]): boolean {
    if (!value) return true; // Allow empty values

    const isValid = allowedValues.includes(value);
    if (!isValid) {
      this.logger.warn(
        `Invalid value "${value}" for field ${fieldName}. Allowed values: ${allowedValues.join(', ')}`
      );
    }
    return isValid;
  }

  /**
   * Get users for a project (assignable users)
   */
  async getProjectUsers(projectKey: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/user/assignable/search`, {
        params: { project: projectKey },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch project users', error);
      throw error;
    }
  }

  /**
   * Get all active users in Jira (for IT Owner selection)
   * Returns up to 1000 active users
   */
  async getAllActiveUsers(): Promise<any[]> {
    try {
      // Use user search with empty query to get all users
      const response = await this.axiosInstance.get(`/user/search`, {
        params: {
          maxResults: 1000,
        },
      });

      // Filter to only active users
      return response.data.filter(user => user.active !== false);
    } catch (error) {
      this.logger.error('Failed to fetch all active users', error);
      throw error;
    }
  }

  /**
   * Sync data FROM Jira TO Capacity Planner
   * This is where you'll implement the logic to pull data from Jira
   * and update your local database
   */
  async syncFromJira(): Promise<{ success: boolean; synced: number }> {
    try {
      // TODO: Implement sync logic
      // 1. Fetch projects from Jira
      // 2. Map to Capacity Planner data model
      // 3. Update database

      const projects = await this.getProjects();
      this.logger.log(`Fetched ${projects.length} projects from Jira`);

      // TODO: Transform and save to database

      return { success: true, synced: projects.length };
    } catch (error) {
      this.logger.error('Failed to sync from Jira', error);
      throw error;
    }
  }

  /**
   * Sync data FROM Capacity Planner TO Jira
   * This is where you'll implement the logic to push data to Jira
   */
  async syncToJira(data: any): Promise<{ success: boolean; updated: number }> {
    try {
      // TODO: Implement sync logic
      // 1. Get data from Capacity Planner database
      // 2. Map to Jira data model
      // 3. Update Jira via API

      this.logger.log('Syncing data to Jira...');

      // TODO: Implement push logic

      return { success: true, updated: 0 };
    } catch (error) {
      this.logger.error('Failed to sync to Jira', error);
      throw error;
    }
  }
}
