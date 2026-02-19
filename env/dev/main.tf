# PostgreSQL Database
module "postgresql" {
  source = "../../modules/postgresql"

  name                   = "psql-capacity-planner-dev"
  resource_group_name    = var.resource_group_name
  location               = var.location
  administrator_login    = "capacityadmin"
  administrator_password = var.administrator_password
  database_name          = "capacity_planner"

  # Development settings - use smaller SKU
  sku_name              = "B_Standard_B1ms"
  storage_mb            = 32768
  backup_retention_days = 7
  geo_redundant_backup  = false

  # Allow Azure services (Container Apps) to connect
  allow_azure_services = true

  # IP restrictions
  allowed_ip_ranges = {
    "office-range-1" = {
      start_ip = "63.137.118.0"
      end_ip   = "63.137.118.255"
    }
    "office-range-2" = {
      start_ip = "63.137.77.0"
      end_ip   = "63.137.77.255"
    }
  }

  tags = var.tags
}

# Container App
module "app" {
  source = "git::https://github.com/SleepNumberInc/terraform-azure-container-app-module.git?ref=initial-creation"

  app_name            = "capacity-planner"
  container_image     = "cldsvcspocacr-dbadgyc8cqfcafgu.azurecr.io/capacity-planner:latest"
  environment_id      = var.environment_id
  resource_group_name = var.resource_group_name
  location            = var.location
  acr_id              = var.acr_id

  cpu          = "0.5"
  memory       = "1Gi"
  min_replicas = 1
  max_replicas = 5

  # Pass database connection string as secret
  database_url = module.postgresql.connection_string_full

  # Azure Entra ID authentication (optional - remove if not needed)
  auth_client_id = var.auth_client_id
  tenant_id      = var.tenant_id

  # Entra ID role-to-group mapping (passed to the app for authorization)
  env_vars = merge(
    var.entra_admin_group_id != null ? { ENTRA_ADMIN_GROUP_ID = var.entra_admin_group_id } : {},
    var.entra_user_group_id != null ? { ENTRA_USER_GROUP_ID = var.entra_user_group_id } : {},
    { AUTH_ENABLED = "true" },
  )

  # IP restrictions
  ip_security_restrictions = []

  tags = var.tags

  depends_on = [module.postgresql]
}
