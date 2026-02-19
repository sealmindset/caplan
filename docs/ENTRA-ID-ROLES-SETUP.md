# Adding Entra ID Roles to a Container App

This guide walks through the full setup for role-based access control (RBAC) using Microsoft Entra ID groups and Azure Container Apps EasyAuth. It is designed for teams deploying containerized NestJS applications via the [terraform-azure-container-app-module](https://github.com/SleepNumberInc/terraform-azure-container-app-module).

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step 1: Azure Portal — App Registration](#step-1-azure-portal--app-registration)
- [Step 2: Azure Portal — Security Groups](#step-2-azure-portal--security-groups)
- [Step 3: Azure Portal — App Roles (Recommended)](#step-3-azure-portal--app-roles-recommended)
- [Step 4: Azure Portal — Token Configuration](#step-4-azure-portal--token-configuration)
- [Step 5: Azure Portal — Assign Groups to App Roles](#step-5-azure-portal--assign-groups-to-app-roles)
- [Step 6: Terraform Configuration](#step-6-terraform-configuration)
- [Step 7: NestJS Application Code](#step-7-nestjs-application-code)
- [Step 8: Local Development](#step-8-local-development)
- [Approach Comparison: App Roles vs Group Claims](#approach-comparison-app-roles-vs-group-claims)
- [Troubleshooting](#troubleshooting)
- [Reference: Full File Listing](#reference-full-file-listing)

---

## Architecture Overview

```
 Browser          Azure Container Apps          NestJS App
┌──────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│           │────>│  EasyAuth (built-in) │────>│  RolesGuard         │
│  User     │     │                      │     │  checks roles from  │
│  logs in  │<────│  1. Redirects to     │     │  X-MS-CLIENT-       │
│  via      │     │     Microsoft login  │     │  PRINCIPAL header   │
│  Entra ID │     │  2. Validates JWT    │     │                     │
│           │     │  3. Injects headers  │     │  @Roles(AppRole.    │
│           │     │  4. Excludes /health │     │    Admin)           │
└──────────┘     └──────────────────────┘     └─────────────────────┘
                         │                             │
                  Terraform module              Application code
                  handles EasyAuth              handles authorization
                  configuration                 (role enforcement)
```

**Key principle**: Azure handles **authentication** (who are you?), your app handles **authorization** (what can you do?).

- **EasyAuth** intercepts every request, redirects unauthenticated users to Microsoft login, validates the JWT, and injects the `X-MS-CLIENT-PRINCIPAL` header with the user's claims.
- **RolesGuard** reads that header, extracts roles (from App Roles or group membership), and enforces access.
- **Health endpoints** (`/health/*`) are excluded from auth so Azure probes work.

---

## Prerequisites

- An Azure subscription with Entra ID (formerly Azure AD)
- The [terraform-azure-container-app-module](https://github.com/SleepNumberInc/terraform-azure-container-app-module) (supports `auth_client_id` and `tenant_id` variables)
- A NestJS application deployed to Azure Container Apps
- Permission to create App Registrations and Security Groups in Entra ID (or access to someone who can)

---

## Step 1: Azure Portal — App Registration

If you don't already have an App Registration for your container app:

1. Go to **Azure Portal > Microsoft Entra ID > App registrations > New registration**
2. Configure:
   - **Name**: Your app name (e.g., `capacity-planner`)
   - **Supported account types**: "Accounts in this organizational directory only" (single-tenant)
   - **Redirect URI**: `https://<your-container-app-url>/.auth/login/aad/callback`
     (This is the callback URL that Azure Container Apps EasyAuth uses)
3. After creation, note the **Application (client) ID** — this is your `auth_client_id`
4. Note the **Directory (tenant) ID** — this is your `tenant_id`

> **Important**: You do NOT need to create a client secret. Container Apps EasyAuth works without one when using the `azapi_resource` auth config approach (the Terraform module sets `clientSecretSettingName = null`).

---

## Step 2: Azure Portal — Security Groups

Create security groups to organize users by role:

1. Go to **Azure Portal > Microsoft Entra ID > Groups > New group**
2. Create groups:

| Group Type | Group Name | Purpose |
|------------|-----------|---------|
| Security | `SG-<AppName>-Admins` | Full admin access (manage connections, sync, mappings) |
| Security | `SG-<AppName>-Users` | Standard read access (view dashboards, capacity data) |

3. **Add members** to each group:
   - Go to the group > Members > Add members
   - Search for and add users
   - Admins should typically also be in the Users group (or handle hierarchy in code)

4. **Record the Object IDs** of each group — you'll need these for either Terraform variables (group claim approach) or App Role assignment.

---

## Step 3: Azure Portal — App Roles (Recommended)

App Roles produce clean, human-readable role names in the JWT token (e.g., `"Admin"` instead of a UUID). This is the recommended approach.

1. Go to **Azure Portal > App registrations > Your app > App roles**
2. Click **Create app role** for each role:

| Display Name | Value | Description | Allowed member types |
|---|---|---|---|
| Admin | `Admin` | Full administrative access | Users/Groups |
| User | `User` | Standard read-only access | Users/Groups |

3. **Enable** each role after creation

The token will include a `roles` claim:
```json
{
  "roles": ["Admin", "User"]
}
```

> **Skip this step** if you prefer using raw group IDs (see [Approach Comparison](#approach-comparison-app-roles-vs-group-claims)).

---

## Step 4: Azure Portal — Token Configuration

This step configures what claims appear in the JWT.

### If using App Roles (Step 3):
No additional configuration needed — App Roles are automatically included in the `roles` claim.

### If using Group Claims instead:

1. Go to **App registrations > Your app > Token configuration**
2. Click **Add groups claim**
3. Select **Security groups**
4. Under **ID token** and **Access token**, check **Group ID**
5. Click **Add**

The token will include a `groups` claim with UUIDs:
```json
{
  "groups": [
    "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
  ]
}
```

> **Warning**: If a user belongs to >200 groups, Entra ID returns an overage indicator instead of the full list. Use App Roles for enterprise environments.

---

## Step 5: Azure Portal — Assign Groups to App Roles

If you created App Roles in Step 3, assign your security groups to them:

1. Go to **Azure Portal > Enterprise applications** (not App registrations)
2. Search for and select your application
3. Go to **Users and groups > Add user/group**
4. Select the group and assign a role:
   - `SG-<AppName>-Admins` -> Role: **Admin**
   - `SG-<AppName>-Users` -> Role: **User**
5. Click **Assign**

Now any user in `SG-<AppName>-Admins` will receive `"Admin"` in their `roles` claim when they authenticate.

---

## Step 6: Terraform Configuration

### 6a. Module Variables (already supported)

The `terraform-azure-container-app-module` already supports authentication via `auth_client_id` and `tenant_id`. When `auth_client_id` is not null, it creates an `azapi_resource "auth_config"` that:

- Enables EasyAuth platform
- Redirects unauthenticated users to Microsoft login
- Excludes health endpoints from authentication
- Validates JWTs against your App Registration

### 6b. Environment Configuration (`env/dev/variables.tf`)

Add variables for the Entra ID group IDs (needed only for the group claim approach):

```hcl
variable "entra_admin_group_id" {
  description = "Entra ID Security Group Object ID for the Admin role"
  type        = string
  default     = null
}

variable "entra_user_group_id" {
  description = "Entra ID Security Group Object ID for the User role"
  type        = string
  default     = null
}
```

### 6c. Pass to Container App (`env/dev/main.tf`)

Pass these as environment variables to the container:

```hcl
module "app" {
  source = "git::https://github.com/SleepNumberInc/terraform-azure-container-app-module.git?ref=initial-creation"

  # ... existing config ...

  auth_client_id = var.auth_client_id
  tenant_id      = var.tenant_id

  env_vars = merge(
    var.entra_admin_group_id != null ? { ENTRA_ADMIN_GROUP_ID = var.entra_admin_group_id } : {},
    var.entra_user_group_id != null ? { ENTRA_USER_GROUP_ID = var.entra_user_group_id } : {},
    { AUTH_ENABLED = "true" },
  )
}
```

### 6d. Set Values in `terraform.tfvars` or CI/CD

```hcl
auth_client_id       = "your-app-registration-client-id"
entra_admin_group_id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
entra_user_group_id  = "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj"
```

Or pass via CI/CD pipeline:
```bash
terraform apply \
  -var="auth_client_id=$AUTH_CLIENT_ID" \
  -var="entra_admin_group_id=$ENTRA_ADMIN_GROUP_ID" \
  -var="entra_user_group_id=$ENTRA_USER_GROUP_ID"
```

---

## Step 7: NestJS Application Code

### File Structure

```
src/auth/
├── auth.module.ts                        # Module definition (registers global guard + middleware)
├── auth.middleware.ts                    # Parses principal and attaches user to request
├── app-role.enum.ts                      # Role enum (User, Admin)
├── entra-id-principal.interface.ts        # Type definitions
├── principal-parser.service.ts            # Parses X-MS-CLIENT-PRINCIPAL header
├── roles.guard.ts                        # Global NestJS guard that enforces roles
├── roles.decorator.ts                    # @Roles() decorator
├── current-user.decorator.ts             # @CurrentUser() parameter decorator
├── index.ts                              # Barrel exports
├── principal-parser.service.spec.ts      # Tests
└── roles.guard.spec.ts                   # Tests
```

### How It Works

1. **EasyAuth** injects `X-MS-CLIENT-PRINCIPAL` header (Base64-encoded JSON) into every request
2. **AuthMiddleware** runs on all routes and calls `PrincipalParserService` to:
   - Decode the header with defense-in-depth validation (`auth_typ === 'aad'`, `objectId` present, `claims` is array)
   - Extract roles from `roles` claim (App Roles) AND/OR `groups` claim (mapped via env vars)
   - Attach the parsed `AppUser` to `request.user`
3. **RolesGuard** (registered globally via `APP_GUARD`) reads the `@Roles()` metadata and checks if the user has any of the required roles. Routes without `@Roles()` are open.
4. **@CurrentUser()** decorator provides typed access to the user in controller methods

### Protecting a Controller

The `RolesGuard` is registered globally — you only need the `@Roles()` decorator (no `@UseGuards` needed):

```typescript
import { Controller, Get } from '@nestjs/common';
import { Roles, AppRole, CurrentUser, AppUser } from '../auth';

@Controller('api/admin')
@Roles(AppRole.Admin)
export class AdminController {

  @Get('status')
  getStatus(@CurrentUser() user: AppUser) {
    return { user: user.name, roles: user.roles };
  }
}
```

### Protecting Individual Endpoints

```typescript
@Controller('api/dashboard')
export class DashboardController {

  @Get('summary')
  @Roles(AppRole.User, AppRole.Admin)
  getSummary() {
    // Both User and Admin roles can access
  }

  @Post('settings')
  @Roles(AppRole.Admin)
  updateSettings() {
    // Only Admin role can access
  }
}
```

### Module Registration

Import `AuthModule` in `AppModule` (only needed once — the guard applies globally):

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth';

@Module({
  imports: [
    AuthModule,
    // ... other modules
  ],
})
export class AppModule {}
```

---

## Step 8: Local Development

EasyAuth only runs on deployed Container Apps. For local development:

### Default Behavior (AUTH_ENABLED not set)

When `NODE_ENV=development` and `AUTH_ENABLED` is not `"true"`, the `RolesGuard` **bypasses authentication entirely**. All endpoints are accessible without the `X-MS-CLIENT-PRINCIPAL` header.

This is the default when using `.env.example`:

```env
NODE_ENV=development
AUTH_ENABLED=false
```

### Testing Roles Locally

To test role enforcement locally, set `AUTH_ENABLED=true` and manually provide the header.

Create a test principal:

```bash
# Create a Base64-encoded principal with Admin role
echo '{"auth_typ":"aad","claims":[{"typ":"http://schemas.microsoft.com/identity/claims/objectidentifier","val":"local-dev-id"},{"typ":"name","val":"Dev User"},{"typ":"preferred_username","val":"dev@example.com"},{"typ":"roles","val":"Admin"}],"name_typ":"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name","role_typ":"http://schemas.microsoft.com/ws/2008/06/identity/claims/role"}' | base64
```

Use it in requests:

```bash
curl -H "X-MS-CLIENT-PRINCIPAL: <base64-output>" http://localhost:8080/api/admin/connections/status
```

---

## Approach Comparison: App Roles vs Group Claims

| Factor | App Roles | Group Claims |
|--------|-----------|-------------|
| **Setup complexity** | Moderate (App Registration manifest + Enterprise App assignment) | Low (just add groups claim to token) |
| **Token readability** | Human-readable (`"Admin"`, `"User"`) | UUIDs (requires mapping) |
| **Env vars needed** | None (roles in token directly) | `ENTRA_ADMIN_GROUP_ID`, `ENTRA_USER_GROUP_ID` |
| **Scalability** | No limits | Breaks at >200 groups per user (overage claim) |
| **Management** | Enterprise Application > Users & groups | Entra ID group membership |
| **Recommendation** | **Production use** | Quick prototyping / PoC |

**You can use both simultaneously**. The `PrincipalParserService` merges roles from both sources and deduplicates.

---

## Troubleshooting

### "401 Unauthorized" on all requests

- Verify `auth_client_id` is set in your Terraform config
- Check the App Registration's redirect URI matches `https://<app-url>/.auth/login/aad/callback`
- Ensure health endpoints are excluded via `auth_excluded_paths` (default: `/health`, `/health/live`, `/health/ready`)

### "403 Forbidden: Access denied. Required roles: Admin"

- Verify the user is in the correct Entra ID security group
- If using App Roles: verify the group is assigned to the role in Enterprise Applications
- If using group claims: verify `ENTRA_ADMIN_GROUP_ID` env var matches the group's Object ID
- Check the token claims by decoding the `X-MS-TOKEN-AAD-ID-TOKEN` header at [jwt.ms](https://jwt.ms)

### Roles missing from token

- If using App Roles: go to Enterprise Applications > Users and groups, verify assignment
- If using group claims: go to App Registration > Token configuration, verify groups claim is added
- Ensure the user has **logged out and logged back in** after role changes (tokens are cached)

### Local development auth errors

- Ensure `NODE_ENV=development` is set in `.env`
- Ensure `AUTH_ENABLED` is NOT set to `"true"` (or remove it entirely)
- The dev bypass only works when both conditions are met

### EasyAuth redirecting health probes

- Verify `auth_excluded_paths` includes all health endpoints
- Default exclusions: `["/health", "/health/", "/health/live", "/health/ready"]`

---

## Reference: Full File Listing

### New Files

| File | Purpose |
|------|---------|
| `src/auth/auth.module.ts` | NestJS module — registers global `APP_GUARD` and `AuthMiddleware` |
| `src/auth/auth.middleware.ts` | Middleware that parses the EasyAuth header and attaches `request.user` |
| `src/auth/app-role.enum.ts` | Enum defining available roles (`User`, `Admin`) |
| `src/auth/entra-id-principal.interface.ts` | TypeScript interfaces for the Entra ID principal and app user |
| `src/auth/principal-parser.service.ts` | Service that decodes `X-MS-CLIENT-PRINCIPAL` with defense-in-depth validation |
| `src/auth/roles.guard.ts` | Global NestJS guard that enforces `@Roles()` decorator requirements |
| `src/auth/roles.decorator.ts` | `@Roles(AppRole.Admin)` decorator for controllers/methods |
| `src/auth/current-user.decorator.ts` | `@CurrentUser()` parameter decorator to access the authenticated user |
| `src/auth/index.ts` | Barrel file exporting all auth module public API |
| `src/auth/principal-parser.service.spec.ts` | Unit tests for principal parsing, validation, and group mapping |
| `src/auth/roles.guard.spec.ts` | Unit tests for guard role enforcement, error masking, and dev bypass |

### Modified Files

| File | Change |
|------|--------|
| `src/app.module.ts` | Added `AuthModule` import |
| `src/admin/admin.controller.ts` | Added `@Roles(AppRole.Admin)` (no `@UseGuards` needed — guard is global) |
| `.env.example` | Added `AUTH_ENABLED`, `ENTRA_ADMIN_GROUP_ID`, `ENTRA_USER_GROUP_ID` |
| `env/dev/variables.tf` | Added `entra_admin_group_id` and `entra_user_group_id` variables |
| `env/dev/main.tf` | Added `env_vars` block passing group IDs and `AUTH_ENABLED` to the container |
