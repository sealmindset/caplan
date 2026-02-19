# Container App Template

Template for deploying containerized applications (Node.js, Python, Java) to Azure Container Apps with Terraform infrastructure.

## Getting Started

### 1. Create Repository from Template

Click "Use this template" on GitHub to create a new repository based on this template.

### 2. Choose Your Language

This template includes starter apps for three languages. **Keep the one you need and delete the others:**

| Language | Directory | Framework |
|----------|-----------|-----------|
| Node.js | `apps/node` | Express.js |
| Python | `apps/python` | FastAPI |
| Java | `apps/java` | Spring Boot |

**Cleanup instructions:**
```bash
# Example: Keep Node.js, delete Python and Java
rm -rf apps/python apps/java
```

### 3. Replace Placeholders

Replace all `__PLACEHOLDER__` values in the codebase. See the [Placeholder Reference](#placeholder-reference) table below.

You can use the interactive setup script:
```bash
python setup.py
```

Or manually search and replace:
```bash
# Find all placeholders
grep -r "__" --include="*.tf" --include="*.yml" --include="*.json" --include="*.toml" --include="*.xml" .
```

### 4. Configure Secrets

Add the following environment secrets/variables to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `CLIENT_SECRET` | Azure service principal client secret |


| Variable | Description |
|----------|-------------|
| `CLIENT_ID` | Azure service principal client ID |
| `TENANT_ID` | Azure tenant ID |
| `SUBSCRIPTION_ID` | Azure subscription ID |
| `ACR_LOGIN_SERVER` | Azure Container Registry URL |

### 5. Push and Deploy

Push your changes to trigger the CI/CD pipeline:
```bash
git add .
git commit -m "feat: configure container app"
git push
```

---

## Placeholder Reference

Replace these values throughout the codebase:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `__APP_NAME__` | Application/container name (lowercase, hyphens) | `my-api` |
| `__APP_TYPE__` | Language type | `node`, `python`, `java` |
| `__COST_CENTER__` | Cost center code | `100.0000.99010.4315` |
| `__DATA_SECURITY__` | Data security classification | `C-IU`, `C-IR`, `C-IC`, `C-IP` |
| `__OWNER__` | Team or individual owner name | `Cloud Compute` |
| `__RESOURCE_GROUP__` | Azure resource group name | `rg-myapp-dev` |
| `__ENVIRONMENT_ID__` | Container Apps Environment ID | `/subscriptions/.../managedEnvironments/...` |
| `__ACR_SERVER__` | Container registry URL | `myacr.azurecr.io` |
| `__AUTH_CLIENT_ID__` | Azure AD app client ID (optional) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

> **Note:** `subscription_id`, `tenant_id`, `client_id`, and `client_secret` are provided by GitHub Actions secrets/variables and do not require placeholders in Terraform files.

---

## Directory Structure

```
.
├── apps/                              # Application templates
│   ├── node/                          # Node.js (Express) template
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── server.test.js
│   │   └── eslint.config.js
│   ├── python/                        # Python (FastAPI) template
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   ├── requirements-dev.txt
│   │   ├── pyproject.toml
│   │   └── tests/
│   └── java/                          # Java (Spring Boot) template
│       ├── Dockerfile
│       ├── pom.xml
│       └── src/
├── env/                               # Terraform environments
│   └── dev/                           # Development environment
│       ├── main.tf                    # Module invocation
│       ├── variables.tf               # Input variables
│       ├── outputs.tf                 # Output definitions
│       ├── provider.tf                # Provider configuration
│       ├── settings.tf                # Required providers
│       └── default.auto.tfvars        # Variable values
├── modules/                           # Reusable Terraform modules
│   └── container-app/                 # Container App module
│       ├── main.tf                    # Resources
│       ├── variables.tf               # Input variables
│       └── outputs.tf                 # Output values
└── .github/workflows/
    ├── container-app-ci.yml           # CI workflow (tests, build, plan)
    └── container-app-cd.yml           # CD workflow (apply, deploy)
```

---

## CI/CD Pipeline

### CI Pipeline (Pull Requests)

Triggered on pull requests and pushes to `development`/`main`:

1. **Unit Tests** - Language-specific test execution
2. **Container Build & Security Scan** - Validates Dockerfile builds and runs Trivy vulnerability scanning
3. **Terraform Plan** - Plans infrastructure changes
4. **Terraform Security Scan** - Terraform security analysis
5. **Linting** - Code formatting validation

### CD Pipeline (Deployments)

Triggered on deployment events:

1. **Change Request** - ServiceNow integration (production environments)
2. **Container Build & Push** - Builds container image and pushes to ACR
3. **Terraform Apply** - Applies infrastructure changes
4. **Container App Update** - Deploys new image version
5. **Readiness Check** - Verifies `/health/ready` endpoint returns 200 OK

---

## Application Requirements

All apps must include:
- `Dockerfile` - Container build instructions
- `/health/live` endpoint - Liveness probe
- `/health/ready` endpoint - Readiness probe
- Port `8080` - Default exposed port

### Health Endpoint Pattern

```
/health/live   - Liveness: Process alive (no dependency checks)
/health/ready  - Readiness: Can handle traffic (check dependencies)
```

---

## Workflow Configuration

### CI Workflow Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `app_path` | Path to application source | Required |
| `app_name` | Container/app name | Required |
| `app_type` | Language: node, python, java | Required |
| `first_env` | First deployment environment | dev |
| `runner_label` | GitHub runner label | onprem-runner |
| `node_version` | Node.js version | 20 |
| `python_version` | Python version | 3.11 |
| `java_version` | Java version | 17 |

### CD Workflow Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `app_path` | Path to application source | Required |
| `app_name` | Container/app name | Required |
| `environment` | Target environment | (from deployment) |
| `cr_environments` | Environments requiring CR | prd |
| `runner_label` | GitHub runner label | onprem-runner |
| `health_check_path` | Health check endpoint path | /health |
| `health_check_retries` | Number of health check attempts | 10 |
| `health_check_interval` | Seconds between retries | 15 |

---

## Prerequisites

- Azure subscription with Container Apps enabled
- Azure Container Registry (ACR)
- Azure Container Apps Environment
- Service principal with appropriate permissions

### Required Azure Resources

1. **Resource Group** - Container for all resources [link](https://github.com/SleepNumberInc/azure-resource-group-management)
2. **Container Apps Environment** - Managed environment for container apps
3. **Container Registry** - ACR for storing container images
4. **App Registration** (optional) - For Azure Entra ID authentication

---

## Adding Additional Environments

The template includes a `dev` environment by default. To add additional environments (e.g., `tst`, `stg`, `prd`):

### 1. Copy the Environment Directory

```bash
# Example: Create production environment
cp -r env/dev env/prd
```

### 2. Update Environment Files

Edit the files in the new environment directory:

**`env/prd/default.auto.tfvars`:**
```hcl
# Note: subscription_id, tenant_id, client_id, client_secret come from GitHub Actions
# Update environment-specific values
resource_group_name = "rg-myapp-prd-scus-01"
location            = "southcentralus"

environment_id = "/subscriptions/.../managedEnvironments/your-prd-environment"

tags = {
  "CostCenter"       = "100.0000.99010.4315"
  "Environment"      = "PRD"  # Update to match environment
  "DataSecurity"     = "C-IU"
  "Owner"            = "Cloud Compute"
  "DeploymentMethod" = "Terraform"
  "Audit"            = "None"
}
```

### 3. Update environments.json

Add or modify the environment chain in `environments.json`:

```json
{
    "dev": {
        "next": "tst"
    },
    "tst": {
        "next": "stg"
    },
    "stg": {
        "next": "prd"
    },
    "prd": {
        "next": "STOP"
    }
}
```

The `next` field defines the deployment promotion chain:
- `"STOP"` - No automatic promotion (end of chain)
- Environment name - Auto-promotes to that environment after successful deployment

### 4. Configure Environment-Specific Secrets

Each environment may require different secrets in GitHub. Use environment-specific secrets or repository secrets with environment overrides.

### 5. Update CI/CD Workflows (if needed)

The workflows automatically read from `environments.json`. If you need environment-specific workflow behavior, update the workflow files:
- `.github/workflows/container-app-ci.yml`
- `.github/workflows/container-app-cd.yml`

---

## Required Secrets

Add the following environment secrets/variables to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `CLIENT_SECRET` | Azure service principal client secret |


| Variable | Description |
|----------|-------------|
| `CLIENT_ID` | Azure service principal client ID |
| `TENANT_ID` | Azure tenant ID |
| `SUBSCRIPTION_ID` | Azure subscription ID |
| `ACR_LOGIN_SERVER` | Azure Container Registry URL |

---

## License

Internal use only - Sleep Number Inc.
