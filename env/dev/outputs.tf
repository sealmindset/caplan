# App Outputs
output "app_url" {
  description = "URL for the application"
  value       = module.app.url
}

output "app_info" {
  description = "App deployment information"
  value       = module.app.deployment_info
}

# Database Outputs
output "database_server" {
  description = "PostgreSQL server FQDN"
  value       = module.postgresql.server_fqdn
}

output "database_name" {
  description = "PostgreSQL database name"
  value       = module.postgresql.database_name
}

# Summary
output "deployed_apps" {
  description = "Summary of all deployed applications"
  value = {
    app = {
      url   = module.app.url
      fqdn  = module.app.fqdn
      owner = var.tags["Owner"]
    }
    database = {
      server   = module.postgresql.server_fqdn
      database = module.postgresql.database_name
    }
  }
}
