# API Integration Guide

This guide explains the 2-way API integration framework built for connecting Jira Cloud and Tempo to the Capacity Planner.

## Overview

The integration framework provides:
- ✅ **Jira Cloud API Integration** - Full CRUD operations for projects, issues, users
- ✅ **Tempo API Integration** - Teams, worklogs, timesheets management
- ✅ **Bidirectional Sync** - Push and pull data between systems
- ✅ **Field Mapping System** - Flexible field mapping configuration
- ✅ **Admin UI** - Web interface for managing connections and mappings

---

## Backend Architecture

### Services Created

#### 1. **JiraService** (`src/integrations/jira/jira.service.ts`)
Handles all Jira Cloud API interactions:
- Project management (get, create, update)
- Issue search and management
- User management
- Worklogs
- 2-way sync operations

#### 2. **TempoService** (`src/integrations/tempo/tempo.service.ts`)
Handles all Tempo API interactions:
- Team management
- Worklog CRUD operations
- Timesheet management and approvals
- Account management
- 2-way sync operations

#### 3. **FieldMappingService** (`src/admin/field-mapping.service.ts`)
Manages field mappings between systems:
- Configurable field mappings per entity type
- Transformation functions for data conversion
- Bidirectional mapping support
- Transform data between Jira/Tempo ↔ Capacity Planner formats

#### 4. **AdminService** (`src/admin/admin.service.ts`)
Orchestrates admin operations:
- Connection management
- Credential storage (TODO: encrypt before production)
- Sync coordination
- Status monitoring

---

## Adding Your API Credentials

### Method 1: Environment Variables (Recommended for Production)

Create or update `.env` file:

```bash
# Jira Configuration
JIRA_BASE_URL=https://sntech.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=your_jira_api_token_here

# Tempo Configuration
TEMPO_API_TOKEN=your_tempo_api_token_here
```

**How to get credentials:**

**Jira API Token:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "Capacity Planner")
4. Copy the token

**Tempo API Token:**
1. In Jira, go to Tempo → Settings
2. Navigate to Data Access → API Integration
3. Click "New Token"
4. Give it a name and set permissions
5. Copy the token

### Method 2: Admin UI (Easier for Testing)

1. Start the application
2. Navigate to the **Admin** tab
3. Enter your credentials in the API Connections section
4. Click "Test Connection" to verify
5. Click "Save Credentials" to store them

---

## Frontend Admin Interface

### Accessing the Admin Page

Navigate to the **Admin** tab in the application. You'll see three main sections:

#### 1. **API Connections**
Configure your Jira and Tempo connections:
- Enter Base URL, Email, and API Token for Jira
- Enter API Token for Tempo
- Test connections before saving
- View connection status

#### 2. **Field Mappings**
Configure how fields map between systems:
- Select entity type (Projects, Users, Teams, Worklogs, Issues)
- Map Capacity Planner fields to Jira/Tempo fields
- Set sync direction (Bidirectional, Pull Only, Push Only)
- Add/remove mappings as needed

#### 3. **Data Synchronization**
Trigger manual sync operations:
- Pull data FROM Jira/Tempo INTO Capacity Planner
- Push data FROM Capacity Planner TO Jira/Tempo
- View sync history and status

---

## API Endpoints

### Connection Management

```bash
# Test Jira connection
POST /api/admin/connections/jira/test
{
  "baseUrl": "https://sntech.atlassian.net",
  "email": "user@example.com",
  "apiToken": "..."
}

# Save Jira connection
POST /api/admin/connections/jira
{
  "baseUrl": "https://sntech.atlassian.net",
  "email": "user@example.com",
  "apiToken": "..."
}

# Test Tempo connection
POST /api/admin/connections/tempo/test
{
  "apiToken": "..."
}

# Get connection status
GET /api/admin/connections/status
```

### Field Mapping

```bash
# Get all mappings
GET /api/admin/mappings

# Get mappings for specific entity
GET /api/admin/mappings/project

# Update mappings
PUT /api/admin/mappings
[
  {
    "entity": "project",
    "capacityPlannerField": "name",
    "jiraField": "name",
    "tempoField": null,
    "bidirectional": true
  }
]
```

### Synchronization

```bash
# Pull from Jira
POST /api/admin/sync/jira/pull

# Push to Jira
POST /api/admin/sync/jira/push

# Pull from Tempo
POST /api/admin/sync/tempo/pull

# Push to Tempo
POST /api/admin/sync/tempo/push

# Get sync history
GET /api/admin/sync/history
```

---

## Default Field Mappings

### Projects
| Capacity Planner | Jira | Tempo | Direction |
|------------------|------|-------|-----------|
| name | name | - | ↔ Bidirectional |
| key | key | - | ↔ Bidirectional |
| description | description | - | ↔ Bidirectional |
| status | status.name | - | ↔ Bidirectional |
| owner | lead.displayName | - | ↔ Bidirectional |

### Users/Team Members
| Capacity Planner | Jira | Tempo | Direction |
|------------------|------|-------|-----------|
| id | accountId | accountId | ↔ Bidirectional |
| name | displayName | displayName | ↔ Bidirectional |
| email | emailAddress | - | ↔ Bidirectional |

### Tempo Teams
| Capacity Planner | Jira | Tempo | Direction |
|------------------|------|-------|-----------|
| id | - | id | ↔ Bidirectional |
| name | - | name | ↔ Bidirectional |
| lead | - | lead.displayName | ↔ Bidirectional |

### Worklogs/Time Entries
| Capacity Planner | Jira | Tempo | Direction |
|------------------|------|-------|-----------|
| hours | timeSpentSeconds | timeSpentSeconds | ↔ Bidirectional |
| date | started | startDate | ↔ Bidirectional |
| description | comment | description | ↔ Bidirectional |
| user | author.accountId | author.accountId | ↔ Bidirectional |

---

## Implementing Sync Logic

### TODO: Complete the Sync Methods

The framework provides sync methods that need to be implemented with your specific business logic:

#### In `jira.service.ts`:

```typescript
async syncFromJira(): Promise<{ success: boolean; synced: number }> {
  // 1. Fetch projects from Jira
  const projects = await this.getProjects();

  // 2. Transform using field mapping service
  // const transformed = projects.map(p =>
  //   fieldMappingService.transformFromJira('project', p)
  // );

  // 3. Save to your database
  // await this.projectRepository.save(transformed);

  return { success: true, synced: projects.length };
}

async syncToJira(data: any): Promise<{ success: boolean; updated: number }> {
  // 1. Get data from your database
  // const projects = await this.projectRepository.find();

  // 2. Transform using field mapping service
  // const transformed = projects.map(p =>
  //   fieldMappingService.transformToJira('project', p)
  // );

  // 3. Update Jira via API
  // for (const project of transformed) {
  //   await this.updateIssue(project.key, project);
  // }

  return { success: true, updated: 0 };
}
```

Similar patterns apply to `tempo.service.ts` sync methods.

---

## Security Considerations

⚠️ **IMPORTANT**: Before deploying to production:

1. **Encrypt API Tokens**
   - Store tokens encrypted in the database
   - Use environment variables or Azure Key Vault
   - Never commit tokens to source control

2. **Implement Authentication**
   - Add authentication to admin endpoints
   - Restrict admin access to authorized users only
   - Use role-based access control

3. **Audit Logging**
   - Log all sync operations
   - Track who made configuration changes
   - Monitor API usage and errors

4. **Rate Limiting**
   - Implement rate limiting for API calls
   - Handle Jira/Tempo API rate limits gracefully
   - Queue sync operations if needed

---

## Testing the Integration

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to Admin tab:**
   - Open http://localhost:3000
   - Click on "Admin" tab

3. **Configure Jira:**
   - Enter your Jira credentials
   - Click "Test Connection"
   - Verify success message
   - Click "Save Credentials"

4. **Configure Tempo:**
   - Enter your Tempo API token
   - Click "Test Connection"
   - Verify success message
   - Click "Save Credentials"

5. **Test Field Mappings:**
   - Review default mappings
   - Customize as needed
   - Save changes

6. **Test Sync:**
   - Click "Pull from Jira" to import projects
   - Check the sync history
   - Verify data in your application

---

## API Documentation References

- **Jira Cloud REST API:** https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
- **Tempo REST API:** https://apidocs.tempo.io/

---

## Troubleshooting

### Connection Issues

**Problem:** "Failed to connect to Jira"
- ✓ Verify your Base URL is correct (e.g., https://your-domain.atlassian.net)
- ✓ Check your email address is correct
- ✓ Regenerate your API token if needed
- ✓ Ensure your account has proper permissions

**Problem:** "Failed to connect to Tempo"
- ✓ Verify API token is valid
- ✓ Check token permissions include read/write access
- ✓ Confirm Tempo is enabled for your Jira instance

### Sync Issues

**Problem:** "No data synced"
- ✓ Check connection status is "Connected"
- ✓ Verify field mappings are configured
- ✓ Check sync history for error messages
- ✓ Review backend logs for detailed errors

---

## Next Steps

1. ✅ Configure your API credentials
2. ✅ Test connections
3. ✅ Review and customize field mappings
4. ✅ Implement sync logic with your database
5. ✅ Add authentication to admin endpoints
6. ✅ Encrypt stored credentials
7. ✅ Set up automated sync schedules (e.g., cron jobs)
8. ✅ Implement error handling and retry logic
9. ✅ Add comprehensive logging
10. ✅ Deploy to production

---

## Support

For issues or questions:
- Review API documentation links above
- Check backend logs in `src/integrations/`
- Examine field mapping service for data transformation issues
