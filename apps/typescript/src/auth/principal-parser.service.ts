import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { EntraIdPrincipal, AppUser } from './entra-id-principal.interface'

const CLAIM_TYPES = {
  objectId: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
  name: 'name',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  upn: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  preferredUsername: 'preferred_username',
  roles: 'roles',
  groups: 'groups',
} as const

@Injectable()
export class PrincipalParserService {
  private readonly logger = new Logger(PrincipalParserService.name)
  private readonly groupRoleMap: ReadonlyMap<string, string>

  constructor(private readonly configService: ConfigService) {
    this.groupRoleMap = this.buildGroupRoleMap()
  }

  parseFromRequest(request: Request): AppUser | null {
    const header = request.headers['x-ms-client-principal'] as string | undefined
    if (!header) {
      return null
    }

    try {
      const decoded = Buffer.from(header, 'base64').toString('utf-8')
      const principal: EntraIdPrincipal = JSON.parse(decoded)

      if (principal.auth_typ !== 'aad') {
        this.logger.warn(`Rejected principal with unexpected auth_typ: ${principal.auth_typ}`)
        return null
      }

      if (!Array.isArray(principal.claims)) {
        this.logger.warn('Rejected principal with non-array claims')
        return null
      }

      const user = this.mapPrincipalToUser(principal)

      if (!user.objectId) {
        this.logger.warn('Rejected principal with missing objectId claim')
        return null
      }

      return user
    } catch {
      this.logger.warn('Failed to decode X-MS-CLIENT-PRINCIPAL header')
      return null
    }
  }

  private mapPrincipalToUser(principal: EntraIdPrincipal): AppUser {
    const claimValue = (type: string): string =>
      principal.claims.find((c) => c.typ === type)?.val ?? ''

    const claimValues = (type: string): readonly string[] =>
      principal.claims.filter((c) => c.typ === type).map((c) => c.val)

    const appRoles = claimValues(CLAIM_TYPES.roles)
    const groupIds = claimValues(CLAIM_TYPES.groups)
    const groupDerivedRoles = groupIds
      .map((id) => this.groupRoleMap.get(id))
      .filter((role): role is string => role !== undefined)

    const allRoles = Array.from(new Set([...appRoles, ...groupDerivedRoles]))

    const email =
      claimValue(CLAIM_TYPES.email) ||
      claimValue(CLAIM_TYPES.upn) ||
      claimValue(CLAIM_TYPES.preferredUsername)

    return {
      objectId: claimValue(CLAIM_TYPES.objectId),
      name: claimValue(CLAIM_TYPES.name),
      email,
      roles: allRoles,
    }
  }

  private buildGroupRoleMap(): ReadonlyMap<string, string> {
    const entries: [string, string][] = []

    const adminGroupId = this.configService.get<string>('ENTRA_ADMIN_GROUP_ID')
    const userGroupId = this.configService.get<string>('ENTRA_USER_GROUP_ID')

    if (adminGroupId) {
      entries.push([adminGroupId, 'Admin'])
    }
    if (userGroupId) {
      entries.push([userGroupId, 'User'])
    }

    return new Map(entries)
  }
}
