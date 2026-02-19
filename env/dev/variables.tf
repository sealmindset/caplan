# Azure Authentication - Populated from GitHub Actions
variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "client_id" {
  description = "Azure service principal client ID"
  type        = string
}

variable "client_secret" {
  description = "Azure service principal client secret"
  type        = string
  sensitive   = true
}

variable "tenant_id" {
  description = "Azure tenant ID"
  type        = string
}

# Authentication
variable "auth_client_id" {
  description = "Azure Entra ID App Registration Client ID for authentication. Set to null to disable auth."
  type        = string
  default     = null
}

variable "entra_admin_group_id" {
  description = "Entra ID Security Group Object ID for the Admin role. Users in this group get Admin access."
  type        = string
  default     = null
}

variable "entra_user_group_id" {
  description = "Entra ID Security Group Object ID for the User role. Users in this group get standard User access."
  type        = string
  default     = null
}

# Container Apps Environment
variable "environment_id" {
  description = "Container App Environment ID (must already exist)"
  type        = string
}

# Azure Container Registry
variable "acr_id" {
  description = "Azure Container Registry resource ID for granting pull permissions"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name (must already exist)"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "southcentralus"
}

# Common Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

# PostgreSQL Configuration
variable "administrator_password" {
  description = "Administrator password for PostgreSQL server"
  type        = string
  sensitive   = true
  default     = null
}
