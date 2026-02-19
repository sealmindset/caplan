# Container App Template

This is a GitHub template repository for deploying containerized applications to Azure Container Apps.

## Quick Reference

- **Language templates**: `apps/node/`, `apps/python/`, `apps/java/`
- **Terraform module**: [terraform-azure-container-app-module](https://github.com/SleepNumberInc/terraform-azure-container-app-module) (external)
- **Environment config**: `env/dev/`
- **CI/CD workflows**: `.github/workflows/container-app-*.yml`

## Available Commands

### /setup-app

Interactive setup wizard for configuring a new app created from this template. Guides users through:
- Choosing their language (Node.js, Python, Java)
- Replacing placeholder values
- Cleaning up unused directories
- Validating Terraform configuration

## Placeholder Values

Files contain `__PLACEHOLDER__` values that must be replaced:

| Placeholder | Description |
|-------------|-------------|
| `__APP_NAME__` | Application name (lowercase, hyphens, 3-48 chars) |
| `__APP_TYPE__` | Language: `node`, `python`, or `java` |
| `__COST_CENTER__` | Cost center code (format: XXX.XXXX.XXXXX.XXXX) |
| `__DATA_SECURITY__` | Data classification: `C-IU`, `C-IR`, `C-IC`, or `C-IP` |
| `__OWNER__` | Team or individual owner name |
| `__RESOURCE_GROUP__` | Azure resource group name |
| `__ENVIRONMENT_ID__` | Container Apps Environment resource ID |
| `__ACR_SERVER__` | ACR URL (e.g., `myacr.azurecr.io`) |
| `__AUTH_CLIENT_ID__` | Azure AD app client ID (optional) |

**Note:** `subscription_id`, `tenant_id`, `client_id`, and `client_secret` are provided by GitHub Actions secrets and do not need placeholders.

## Architecture

```
apps/
├── node/          # Express.js app template
├── python/        # FastAPI app template
└── java/          # Spring Boot app template

modules/
└── postgresql/    # Terraform module for PostgreSQL

env/
└── dev/           # Development environment config
```

The Container App module is sourced externally from [terraform-azure-container-app-module](https://github.com/SleepNumberInc/terraform-azure-container-app-module).

## Health Endpoints

All app templates implement:
- `/health/live` - Liveness probe (no dependency checks)
- `/health/ready` - Readiness probe (check dependencies)
- `/health` - Legacy endpoint

## CI/CD Pipeline

- **CI** (container-app-ci.yml): Tests, builds, security scan, terraform plan
- **CD** (container-app-cd.yml): Deploy to ACR, terraform apply, health check
