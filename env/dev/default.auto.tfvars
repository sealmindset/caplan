# Azure Configuration
# Note: subscription_id, tenant_id, client_id, client_secret are provided by GitHub Actions secrets
# Replace __PLACEHOLDER__ values with your actual configuration
location = "southcentralus"


# Container App Environment
# Get this from Azure Portal: Container Apps Environment > Properties > Resource ID
environment_id = "/subscriptions/5fd3e0c8-36e3-4f27-a1ea-e3aa21650100/resourceGroups/rg-cldsvcs-sbx-scus-01/providers/Microsoft.App/managedEnvironments/platform-env"

# Azure Container Registry
# Get this from Azure Portal: Container Registry > Properties > Resource ID
acr_id = "/subscriptions/5fd3e0c8-36e3-4f27-a1ea-e3aa21650100/resourceGroups/rg-cldsvcs-sbx-scus-01/providers/Microsoft.ContainerRegistry/registries/cldsvcspocacr"

# PostgreSQL Configuration
# IMPORTANT: In production, use GitHub Actions secrets instead of hardcoding
# Set via: TF_VAR_postgres_admin_password in GitHub Actions secrets
#postgres_admin_password = "__POSTGRES_PASSWORD__"

# Common tags - Required for all Azure resources
# See: https://sleepnumber.atlassian.net/wiki/spaces/CLOUD/pages/Azure+Tagging+Standards
tags = {
  "CostCenter"       = "100.0000.99010.4315" # Format: XXX.XXXX.XXXXX.XXXX (e.g., 100.0000.99010.4315)
  "Environment"      = "DEV"
  "DataSecurity"     = "C-IU"                    # C-IU, C-IR, C-IC, or C-IP
  "Owner"            = "Agile Enablement Office" # Team or individual owner name
  "DeploymentMethod" = "Terraform"
  "Audit"            = "None"
}

entra_user_group_id  = "39fbfd30-759d-4e5f-96f1-f5e0fb190855" # poc-sg-capacity-planner-Users
entra_admin_group_id = "e4c7d910-01b8-4d8f-9150-38a6a6d7cd0f" # poc-sg-capacity-planner-Admins