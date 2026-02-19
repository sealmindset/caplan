import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

/**
 * Tempo API Integration Service
 * Documentation: https://apidocs.tempo.io/
 */
@Injectable()
export class TempoService {
  private readonly logger = new Logger(TempoService.name);
  private axiosInstance: AxiosInstance;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize Tempo API client with authentication
   *
   * TODO: Add your Tempo credentials here or load from environment/config
   *
   * REQUIRED CREDENTIALS:
   * - apiToken: Generate from Tempo Settings > Data Access > API Integration
   */
  private initializeClient() {
    // TODO: Replace with your actual API token or load from config service
    const apiToken = process.env.TEMPO_API_TOKEN || ''; // TODO: Add your Tempo API token

    if (!apiToken) {
      this.logger.warn('Tempo API token not configured. API calls will fail.');
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.tempo.io/4',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Update Tempo connection settings
   */
  async updateConnection(apiToken: string) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.tempo.io/4',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('Tempo connection settings updated');
  }

  /**
   * Test the Tempo connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test by fetching teams (requires read permission)
      await this.axiosInstance.get('/teams');
      return {
        success: true,
        message: 'Successfully connected to Tempo',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get all Tempo teams
   */
  async getTeams(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/teams');
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to fetch teams from Tempo', error);
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId: number): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch team ${teamId}`, error);
      throw error;
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: number): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/teams/${teamId}/members`);
      return response.data.results;
    } catch (error) {
      this.logger.error(`Failed to fetch team ${teamId} members`, error);
      throw error;
    }
  }

  /**
   * Get worklogs with filters
   */
  async getWorklogs(params: {
    from?: string;
    to?: string;
    project?: string[];
    issue?: string[];
    offset?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/worklogs', { params });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch worklogs', error);
      throw error;
    }
  }

  /**
   * Get worklog by ID
   */
  async getWorklog(worklogId: number): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/worklogs/${worklogId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch worklog ${worklogId}`, error);
      throw error;
    }
  }

  /**
   * Create a new worklog
   */
  async createWorklog(worklogData: {
    issueKey: string;
    timeSpentSeconds: number;
    startDate: string;
    startTime: string;
    description: string;
    authorAccountId: string;
  }): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/worklogs', worklogData);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create worklog', error);
      throw error;
    }
  }

  /**
   * Update an existing worklog
   */
  async updateWorklog(worklogId: number, updateData: any): Promise<any> {
    try {
      const response = await this.axiosInstance.put(`/worklogs/${worklogId}`, updateData);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update worklog ${worklogId}`, error);
      throw error;
    }
  }

  /**
   * Delete a worklog
   */
  async deleteWorklog(worklogId: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/worklogs/${worklogId}`);
      this.logger.log(`Worklog ${worklogId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete worklog ${worklogId}`, error);
      throw error;
    }
  }

  /**
   * Get user worklogs for a date range
   */
  async getUserWorklogs(accountId: string, from: string, to: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/worklogs/user/${accountId}`, {
        params: { from, to },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch user worklogs', error);
      throw error;
    }
  }

  /**
   * Get timesheets
   */
  async getTimesheets(from: string, to: string, accountId?: string): Promise<any[]> {
    try {
      const params: any = { from, to };
      if (accountId) params.accountId = accountId;

      const response = await this.axiosInstance.get('/timesheets', { params });
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to fetch timesheets', error);
      throw error;
    }
  }

  /**
   * Approve timesheet
   */
  async approveTimesheet(timesheetId: number): Promise<void> {
    try {
      await this.axiosInstance.post(`/timesheets/${timesheetId}/approve`);
      this.logger.log(`Timesheet ${timesheetId} approved`);
    } catch (error) {
      this.logger.error(`Failed to approve timesheet ${timesheetId}`, error);
      throw error;
    }
  }

  /**
   * Reject timesheet
   */
  async rejectTimesheet(timesheetId: number, comment?: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/timesheets/${timesheetId}/reject`, { comment });
      this.logger.log(`Timesheet ${timesheetId} rejected`);
    } catch (error) {
      this.logger.error(`Failed to reject timesheet ${timesheetId}`, error);
      throw error;
    }
  }

  /**
   * Get Tempo accounts (for time tracking categories)
   */
  async getAccounts(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/accounts');
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to fetch accounts', error);
      throw error;
    }
  }

  /**
   * Get account by key
   */
  async getAccount(accountKey: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/accounts/${accountKey}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch account ${accountKey}`, error);
      throw error;
    }
  }

  /**
   * Sync data FROM Tempo TO Capacity Planner
   * This is where you'll implement the logic to pull data from Tempo
   * and update your local database
   */
  async syncFromTempo(): Promise<{ success: boolean; synced: number }> {
    try {
      // TODO: Implement sync logic
      // 1. Fetch teams, worklogs, timesheets from Tempo
      // 2. Map to Capacity Planner data model
      // 3. Update database

      const teams = await this.getTeams();
      this.logger.log(`Fetched ${teams.length} teams from Tempo`);

      // TODO: Transform and save to database

      return { success: true, synced: teams.length };
    } catch (error) {
      this.logger.error('Failed to sync from Tempo', error);
      throw error;
    }
  }

  /**
   * Sync data FROM Capacity Planner TO Tempo
   * This is where you'll implement the logic to push data to Tempo
   */
  async syncToTempo(data: any): Promise<{ success: boolean; updated: number }> {
    try {
      // TODO: Implement sync logic
      // 1. Get data from Capacity Planner database
      // 2. Map to Tempo data model
      // 3. Update Tempo via API

      this.logger.log('Syncing data to Tempo...');

      // TODO: Implement push logic

      return { success: true, updated: 0 };
    } catch (error) {
      this.logger.error('Failed to sync to Tempo', error);
      throw error;
    }
  }
}
