---
name: setup-app
description: Interactive setup wizard for configuring a new app created from this template. Guides through language selection, placeholder replacement, and validation.
---

# Setup App Skill

This skill helps users configure their container app repository after creating it from the template.

## Invocation

```
/setup-app
```

## Description

Interactive setup wizard for configuring your container app. Guides you through:
- Choosing your language (Node.js, Python, or Java)
- Replacing placeholder values with your configuration
- Cleaning up unused language directories
- Validating your setup

---

## Instructions

When invoked, follow this workflow:

### Step 1: Welcome and Language Selection

Ask the user which language they want to use:

```
Welcome to the Container App Template setup!

Which language will your app use?
1. Node.js (Express)
2. Python (FastAPI)
3. Java (Spring Boot)
```

Use AskUserQuestion to get their choice.

### Step 2: Gather Configuration Values

After they choose a language, collect the following values using AskUserQuestion (you can ask multiple at once):

**Required values:**
- `APP_NAME` - Application name (lowercase, hyphens only, 3-48 chars). Example: `my-api`

**Azure tags (required for all resources):**
- `COST_CENTER` - Cost center code in format XXX.XXXX.XXXXX.XXXX. Example: `100.0000.99010.4315`
- `DATA_SECURITY` - Data security classification: `C-IU` (Internal Use), `C-LD` (Limited Distribution), `C-Re` (Confidential Restricted), or `Public` (Public)
- `OWNER` - Team or individual owner name. Example: `Cloud Compute`

**Azure values:**
- `RESOURCE_GROUP` - Azure resource group name. Example: `rg-myapp-dev-scus-01`
- `ENVIRONMENT_ID` - Container Apps Environment resource ID
- `ACR_SERVER` - Azure Container Registry URL. Example: `myacr.azurecr.io`

> **Note:** `subscription_id`, `tenant_id`, `client_id`, and `client_secret` are provided by GitHub Actions secrets/variables - do not prompt for these.

**Optional:**
- `AUTH_CLIENT_ID` - Azure AD App Registration Client ID for authentication. Can skip if auth not needed.

### Step 3: Validate Inputs

Validate the inputs:
- `APP_NAME`: Must match `^[a-z0-9-]{3,48}$`
- `COST_CENTER`: Must match `^\d{3}\.\d{4}\.\d{5}\.\d{4}$` (e.g., 100.0000.99010.4315)
- `DATA_SECURITY`: Must be one of: `C-IU`, `C-LD`, `C-RE`, `Public`
- `OWNER`: Must be at least 2 characters
- `RESOURCE_GROUP`: Must be at least 3 characters
- `ACR_SERVER`: Must end with `.azurecr.io`
- `ENVIRONMENT_ID`: Must start with `/subscriptions/` and contain `managedEnvironments`
- `AUTH_CLIENT_ID`: Must be UUID format if provided (optional)

If validation fails, ask the user to correct the value.

### Step 4: Replace Placeholders

Replace placeholders in these files:

**App files (based on chosen language):**
- `apps/{language}/package.json` (Node.js) - Replace `__APP_NAME__`
- `apps/{language}/pyproject.toml` (Python) - Replace `__APP_NAME__`
- `apps/{language}/pom.xml` (Java) - Replace `__APP_NAME__`

**Terraform files:**
- `env/dev/main.tf` - Replace `__APP_NAME__`, `__APP_TYPE__`, `__ACR_SERVER__`, `__AUTH_CLIENT_ID__`
- `env/dev/default.auto.tfvars` - Replace all tag placeholders (`__COST_CENTER__`, `__DATA_SECURITY__`, `__OWNER__`, `__RESOURCE_GROUP__`, `__ENVIRONMENT_ID__`)

**Workflow files:**
- `.github/workflows/container-app-ci.yml` - Replace `__APP_NAME__` and `__APP_TYPE__`
- `.github/workflows/container-app-cd.yml` - Replace `__APP_NAME__` and `__APP_TYPE__`

Use the Edit tool with `replace_all: true` for efficiency.

### Step 5: Clean Up Unused Languages

Ask the user if they want to remove the unused language directories:

```
Would you like to remove the unused app directories?
This will delete: apps/python, apps/java (keeping apps/node)
```

If yes, use Bash to remove the directories:
```bash
rm -rf apps/python apps/java
```

### Step 6: Handle Authentication (Optional)

If the user skipped `AUTH_CLIENT_ID`, offer to remove the auth configuration:

```
You skipped authentication setup. Would you like to:
1. Keep auth config (configure later)
2. Remove auth config from Terraform
```

If they choose to remove, edit `env/dev/main.tf` to remove or comment out the `auth_client_id` and related lines.

### Step 7: Validate Terraform

Run terraform validation:

```bash
cd env/dev && terraform init -backend=false && terraform validate
```

Report any errors to the user.

### Step 8: Summary and Next Steps

Provide a summary:

```
Setup complete!

Configuration:
- App Name: {APP_NAME}
- Language: {LANGUAGE}
- Owner: {OWNER}
- Cost Center: {COST_CENTER}
- Data Security: {DATA_SECURITY}
- Resource Group: {RESOURCE_GROUP}
- ACR: {ACR_SERVER}

Files modified:
- apps/{language}/...
- env/dev/main.tf
- env/dev/default.auto.tfvars
- .github/workflows/container-app-ci.yml
- .github/workflows/container-app-cd.yml

Next steps:
1. Add your application code to apps/{language}/
2. Configure GitHub repository secrets:
   - CLIENT_ID
   - CLIENT_SECRET
   - TENANT_ID
   - SUBSCRIPTION_ID
   - ACR_LOGIN_SERVER
   - RESOURCE_GROUP_NAME
3. Commit and push your changes
4. Open a PR to trigger CI pipeline
```

---

## Placeholder Reference

| Placeholder | Replacement Variable |
|-------------|---------------------|
| `__APP_NAME__` | APP_NAME |
| `__APP_TYPE__` | Language choice (node/python/java) |
| `__COST_CENTER__` | COST_CENTER |
| `__DATA_SECURITY__` | DATA_SECURITY |
| `__OWNER__` | OWNER |
| `__RESOURCE_GROUP__` | RESOURCE_GROUP |
| `__ENVIRONMENT_ID__` | ENVIRONMENT_ID |
| `__ACR_SERVER__` | ACR_SERVER |
| `__AUTH_CLIENT_ID__` | AUTH_CLIENT_ID (optional) |

> **Note:** `subscription_id`, `tenant_id`, `client_id`, and `client_secret` are provided by GitHub Actions and do not need placeholders.

---

## Error Handling

- If a file doesn't exist, skip it and warn the user
- If terraform validate fails, show the error and suggest fixes
- If user cancels mid-setup, inform them they can run `/setup-app` again
