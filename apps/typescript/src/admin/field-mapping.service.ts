import { Injectable, Logger } from '@nestjs/common';

export interface FieldMapping {
  entity: string; // 'project', 'user', 'worklog', 'team', etc.
  capacityPlannerField: string;
  jiraField?: string;
  tempoField?: string;
  transformFunction?: string; // Name of transformation function to apply
  bidirectional: boolean; // Can sync both ways?
}

/**
 * Field Mapping Service
 * Manages mappings between Capacity Planner, Jira, and Tempo fields
 *
 * CAPACITY AND ALLOCATION DEFINITIONS:
 * - Capacity: How many hours one member can do within a 40-hour week
 * - Allocation: How many projects they are assigned to at a given time
 *
 * These definitions inform how worklog, user, and team data should be transformed
 * between systems to ensure accurate capacity planning and resource allocation.
 */
@Injectable()
export class FieldMappingService {
  private readonly logger = new Logger(FieldMappingService.name);

  // Default field mappings
  // TODO: Store these in database for persistence
  private mappings: FieldMapping[] = [
    // Project mappings
    {
      entity: 'project',
      capacityPlannerField: 'name',
      jiraField: 'name',
      tempoField: null,
      bidirectional: true,
    },
    {
      entity: 'project',
      capacityPlannerField: 'key',
      jiraField: 'key',
      tempoField: null,
      bidirectional: true,
    },
    {
      entity: 'project',
      capacityPlannerField: 'description',
      jiraField: 'description',
      tempoField: null,
      bidirectional: true,
    },
    {
      entity: 'project',
      capacityPlannerField: 'status',
      jiraField: 'status.name',
      tempoField: null,
      transformFunction: 'normalizeStatus',
      bidirectional: true,
    },
    {
      entity: 'project',
      capacityPlannerField: 'owner',
      jiraField: 'lead.displayName',
      tempoField: null,
      bidirectional: true,
    },

    // User/Team Member mappings
    {
      entity: 'user',
      capacityPlannerField: 'id',
      jiraField: 'accountId',
      tempoField: 'accountId',
      bidirectional: true,
    },
    {
      entity: 'user',
      capacityPlannerField: 'name',
      jiraField: 'displayName',
      tempoField: 'displayName',
      bidirectional: true,
    },
    {
      entity: 'user',
      capacityPlannerField: 'email',
      jiraField: 'emailAddress',
      tempoField: null,
      bidirectional: true,
    },

    // Tempo Team mappings
    {
      entity: 'team',
      capacityPlannerField: 'id',
      jiraField: null,
      tempoField: 'id',
      bidirectional: true,
    },
    {
      entity: 'team',
      capacityPlannerField: 'name',
      jiraField: null,
      tempoField: 'name',
      bidirectional: true,
    },
    {
      entity: 'team',
      capacityPlannerField: 'lead',
      jiraField: null,
      tempoField: 'lead.displayName',
      bidirectional: true,
    },

    // Worklog/Time tracking mappings
    {
      entity: 'worklog',
      capacityPlannerField: 'hours',
      jiraField: 'timeSpentSeconds',
      tempoField: 'timeSpentSeconds',
      transformFunction: 'convertSecondsToHours',
      bidirectional: true,
    },
    {
      entity: 'worklog',
      capacityPlannerField: 'date',
      jiraField: 'started',
      tempoField: 'startDate',
      transformFunction: 'normalizeDate',
      bidirectional: true,
    },
    {
      entity: 'worklog',
      capacityPlannerField: 'description',
      jiraField: 'comment',
      tempoField: 'description',
      bidirectional: true,
    },
    {
      entity: 'worklog',
      capacityPlannerField: 'user',
      jiraField: 'author.accountId',
      tempoField: 'author.accountId',
      bidirectional: true,
    },

    // Issue mappings (if you want to sync individual issues)
    {
      entity: 'issue',
      capacityPlannerField: 'title',
      jiraField: 'summary',
      tempoField: null,
      bidirectional: true,
    },
    {
      entity: 'issue',
      capacityPlannerField: 'key',
      jiraField: 'key',
      tempoField: 'issueKey',
      bidirectional: true,
    },
    {
      entity: 'issue',
      capacityPlannerField: 'priority',
      jiraField: 'priority.name',
      tempoField: null,
      transformFunction: 'normalizePriority',
      bidirectional: true,
    },
  ];

  /**
   * Get all field mappings
   */
  getAllMappings(): FieldMapping[] {
    return this.mappings;
  }

  /**
   * Get mappings for a specific entity
   */
  getEntityMapping(entity: string): FieldMapping[] {
    return this.mappings.filter(m => m.entity === entity);
  }

  /**
   * Update field mappings
   * TODO: Persist to database
   */
  updateMappings(newMappings: FieldMapping[]): { success: boolean; message: string } {
    try {
      // Validate mappings
      for (const mapping of newMappings) {
        if (!mapping.entity || !mapping.capacityPlannerField) {
          throw new Error('Invalid mapping: entity and capacityPlannerField are required');
        }
      }

      // TODO: Save to database
      this.mappings = newMappings;

      this.logger.log(`Updated ${newMappings.length} field mappings`);
      return { success: true, message: 'Field mappings updated successfully' };
    } catch (error) {
      this.logger.error('Failed to update field mappings', error);
      throw error;
    }
  }

  /**
   * Add a new field mapping
   */
  addMapping(mapping: FieldMapping): void {
    this.mappings.push(mapping);
    // TODO: Persist to database
  }

  /**
   * Remove a field mapping
   */
  removeMapping(entity: string, field: string): void {
    this.mappings = this.mappings.filter(
      m => !(m.entity === entity && m.capacityPlannerField === field)
    );
    // TODO: Persist to database
  }

  /**
   * Transform data from Jira to Capacity Planner format
   */
  transformFromJira(entity: string, jiraData: any): any {
    const entityMappings = this.getEntityMapping(entity);
    const transformed: any = {};

    for (const mapping of entityMappings) {
      if (!mapping.jiraField) continue;

      const value = this.getNestedValue(jiraData, mapping.jiraField);

      if (value !== undefined) {
        transformed[mapping.capacityPlannerField] = mapping.transformFunction
          ? this.applyTransform(mapping.transformFunction, value, 'fromJira')
          : value;
      }
    }

    return transformed;
  }

  /**
   * Transform data from Tempo to Capacity Planner format
   */
  transformFromTempo(entity: string, tempoData: any): any {
    const entityMappings = this.getEntityMapping(entity);
    const transformed: any = {};

    for (const mapping of entityMappings) {
      if (!mapping.tempoField) continue;

      const value = this.getNestedValue(tempoData, mapping.tempoField);

      if (value !== undefined) {
        transformed[mapping.capacityPlannerField] = mapping.transformFunction
          ? this.applyTransform(mapping.transformFunction, value, 'fromTempo')
          : value;
      }
    }

    return transformed;
  }

  /**
   * Transform data from Capacity Planner to Jira format
   */
  transformToJira(entity: string, capacityData: any): any {
    const entityMappings = this.getEntityMapping(entity).filter(m => m.bidirectional && m.jiraField);
    const transformed: any = {};

    for (const mapping of entityMappings) {
      const value = capacityData[mapping.capacityPlannerField];

      if (value !== undefined) {
        this.setNestedValue(
          transformed,
          mapping.jiraField,
          mapping.transformFunction
            ? this.applyTransform(mapping.transformFunction, value, 'toJira')
            : value
        );
      }
    }

    return transformed;
  }

  /**
   * Transform data from Capacity Planner to Tempo format
   */
  transformToTempo(entity: string, capacityData: any): any {
    const entityMappings = this.getEntityMapping(entity).filter(m => m.bidirectional && m.tempoField);
    const transformed: any = {};

    for (const mapping of entityMappings) {
      const value = capacityData[mapping.capacityPlannerField];

      if (value !== undefined) {
        this.setNestedValue(
          transformed,
          mapping.tempoField,
          mapping.transformFunction
            ? this.applyTransform(mapping.transformFunction, value, 'toTempo')
            : value
        );
      }
    }

    return transformed;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((current, prop) => {
      if (!current[prop]) current[prop] = {};
      return current[prop];
    }, obj);
    target[last] = value;
  }

  /**
   * Apply transformation function
   * TODO: Implement actual transformation functions
   */
  private applyTransform(functionName: string, value: any, direction: string): any {
    switch (functionName) {
      case 'convertSecondsToHours':
        return direction.includes('from') ? value / 3600 : value * 3600;
      case 'normalizeStatus':
      case 'normalizePriority':
      case 'normalizeDate':
        // TODO: Implement these transformations
        return value;
      default:
        return value;
    }
  }
}
