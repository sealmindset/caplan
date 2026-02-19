import { ConfigService } from '@nestjs/config'
import { PrincipalParserService } from './principal-parser.service'
import { EntraIdPrincipal } from './entra-id-principal.interface'

function createPrincipal(overrides: Partial<EntraIdPrincipal> = {}): EntraIdPrincipal {
  return {
    auth_typ: 'aad',
    name_typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    role_typ: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
    claims: [],
    ...overrides,
  }
}

function encodeHeader(principal: EntraIdPrincipal): string {
  return Buffer.from(JSON.stringify(principal)).toString('base64')
}

function createMockRequest(header?: string): any {
  return {
    headers: header ? { 'x-ms-client-principal': header } : {},
  }
}

describe('PrincipalParserService', () => {
  const createService = (envVars: Record<string, string> = {}): PrincipalParserService => {
    const configService = {
      get: jest.fn((key: string) => envVars[key]),
    } as unknown as ConfigService

    return new PrincipalParserService(configService)
  }

  describe('parseFromRequest', () => {
    it('returns null when header is missing', () => {
      const service = createService()
      const request = createMockRequest()

      expect(service.parseFromRequest(request)).toBeNull()
    })

    it('returns null when header is invalid base64', () => {
      const service = createService()
      const request = createMockRequest('not-valid-base64!!!')

      expect(service.parseFromRequest(request)).toBeNull()
    })

    it('returns null when header is not valid JSON after decoding', () => {
      const service = createService()
      const request = createMockRequest(Buffer.from('not json').toString('base64'))

      expect(service.parseFromRequest(request)).toBeNull()
    })

    it('returns null when auth_typ is not aad', () => {
      const service = createService()
      const principal = createPrincipal({
        auth_typ: 'github',
        claims: [
          {
            typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
            val: 'user-object-id',
          },
        ],
      })

      const request = createMockRequest(encodeHeader(principal))
      expect(service.parseFromRequest(request)).toBeNull()
    })

    it('returns null when claims is not an array', () => {
      const service = createService()
      const principal = { auth_typ: 'aad', claims: 'not-an-array' } as any

      const request = createMockRequest(encodeHeader(principal))
      expect(service.parseFromRequest(request)).toBeNull()
    })

    it('returns null when objectId claim is missing', () => {
      const service = createService()
      const principal = createPrincipal({
        claims: [
          { typ: 'name', val: 'No OID User' },
          { typ: 'preferred_username', val: 'nooid@example.com' },
        ],
      })

      const request = createMockRequest(encodeHeader(principal))
      expect(service.parseFromRequest(request)).toBeNull()
    })

    it('parses a valid principal with App Roles', () => {
      const service = createService()
      const principal = createPrincipal({
        claims: [
          {
            typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
            val: 'user-object-id',
          },
          { typ: 'name', val: 'Lukas Menne' },
          { typ: 'preferred_username', val: 'lukas@example.com' },
          { typ: 'roles', val: 'Admin' },
          { typ: 'roles', val: 'User' },
        ],
      })

      const request = createMockRequest(encodeHeader(principal))
      const user = service.parseFromRequest(request)

      expect(user).toEqual({
        objectId: 'user-object-id',
        name: 'Lukas Menne',
        email: 'lukas@example.com',
        roles: ['Admin', 'User'],
      })
    })

    it('uses email claim over UPN when available', () => {
      const service = createService()
      const principal = createPrincipal({
        claims: [
          {
            typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
            val: 'id-1',
          },
          { typ: 'name', val: 'Test' },
          {
            typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
            val: 'email@example.com',
          },
          {
            typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
            val: 'upn@example.com',
          },
        ],
      })

      const user = service.parseFromRequest(createMockRequest(encodeHeader(principal)))
      expect(user?.email).toBe('email@example.com')
    })

    it('falls back to UPN when email claim is missing', () => {
      const service = createService()
      const principal = createPrincipal({
        claims: [
          {
            typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
            val: 'id-1',
          },
          { typ: 'name', val: 'Test' },
          {
            typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
            val: 'upn@example.com',
          },
        ],
      })

      const user = service.parseFromRequest(createMockRequest(encodeHeader(principal)))
      expect(user?.email).toBe('upn@example.com')
    })
  })

  describe('group-to-role mapping', () => {
    it('maps group IDs to roles when env vars are configured', () => {
      const service = createService({
        ENTRA_ADMIN_GROUP_ID: 'admin-group-id',
        ENTRA_USER_GROUP_ID: 'user-group-id',
      })

      const principal = createPrincipal({
        claims: [
          {
            typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
            val: 'id-1',
          },
          { typ: 'name', val: 'Test' },
          { typ: 'preferred_username', val: 'test@example.com' },
          { typ: 'groups', val: 'admin-group-id' },
        ],
      })

      const user = service.parseFromRequest(createMockRequest(encodeHeader(principal)))
      expect(user?.roles).toEqual(['Admin'])
    })

    it('combines App Roles and group-derived roles without duplicates', () => {
      const service = createService({
        ENTRA_ADMIN_GROUP_ID: 'admin-group-id',
      })

      const principal = createPrincipal({
        claims: [
          {
            typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
            val: 'id-1',
          },
          { typ: 'name', val: 'Test' },
          { typ: 'preferred_username', val: 'test@example.com' },
          { typ: 'roles', val: 'Admin' },
          { typ: 'groups', val: 'admin-group-id' },
        ],
      })

      const user = service.parseFromRequest(createMockRequest(encodeHeader(principal)))
      expect(user?.roles).toEqual(['Admin'])
    })

    it('ignores unknown group IDs', () => {
      const service = createService({
        ENTRA_ADMIN_GROUP_ID: 'admin-group-id',
      })

      const principal = createPrincipal({
        claims: [
          {
            typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
            val: 'id-1',
          },
          { typ: 'name', val: 'Test' },
          { typ: 'preferred_username', val: 'test@example.com' },
          { typ: 'groups', val: 'unknown-group-id' },
        ],
      })

      const user = service.parseFromRequest(createMockRequest(encodeHeader(principal)))
      expect(user?.roles).toEqual([])
    })
  })
})
