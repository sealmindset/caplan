variable "name" {
  description = "Name of the PostgreSQL server"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]{3,63}$", var.name))
    error_message = "Name must be 3-63 characters, lowercase letters, numbers, and hyphens only."
  }
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for the PostgreSQL server"
  type        = string
}

variable "administrator_login" {
  description = "Administrator login name for the PostgreSQL server"
  type        = string
  default     = "pgadmin"
}

variable "administrator_password" {
  description = "Administrator password for the PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "sku_name" {
  description = "SKU name for the PostgreSQL server (e.g., B_Standard_B1ms, GP_Standard_D2s_v3)"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "storage_mb" {
  description = "Max storage allowed for the PostgreSQL server in MB"
  type        = number
  default     = 32768
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"

  validation {
    condition     = contains(["11", "12", "13", "14", "15", "16"], var.postgres_version)
    error_message = "PostgreSQL version must be one of: 11, 12, 13, 14, 15, 16"
  }
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
  default     = "app"
}

variable "backup_retention_days" {
  description = "Backup retention days for the PostgreSQL server"
  type        = number
  default     = 7

  validation {
    condition     = var.backup_retention_days >= 7 && var.backup_retention_days <= 35
    error_message = "Backup retention days must be between 7 and 35"
  }
}

variable "geo_redundant_backup" {
  description = "Enable geo-redundant backups"
  type        = bool
  default     = false
}

variable "public_network_access" {
  description = "Enable public network access"
  type        = bool
  default     = true
}

variable "allowed_ip_ranges" {
  description = "Map of IP ranges allowed to access the PostgreSQL server"
  type = map(object({
    start_ip = string
    end_ip   = string
  }))
  default = {}
}

variable "allow_azure_services" {
  description = "Allow Azure services to access the PostgreSQL server"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
