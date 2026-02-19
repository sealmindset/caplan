import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'
import { AppRole } from './app-role.enum'
import { AppUser } from './entra-id-principal.interface'

function createMockContext(request: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext
}

function createUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    objectId: 'id-1',
    name: 'Test User',
    email: 'test@example.com',
    roles: [],
    ...overrides,
  }
}

describe('RolesGuard', () => {
  const createGuard = (
    requiredRoles: AppRole[] | undefined,
    envVars: Record<string, string> = {},
  ): RolesGuard => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
    } as unknown as Reflector

    const configService = {
      get: jest.fn((key: string) => envVars[key]),
    } as unknown as ConfigService

    return new RolesGuard(reflector, configService)
  }

  describe('when no roles are required', () => {
    it('allows access when @Roles() is not present', () => {
      const guard = createGuard(undefined)
      const context = createMockContext({ headers: {} })

      expect(guard.canActivate(context)).toBe(true)
    })

    it('allows access when @Roles() has empty array', () => {
      const guard = createGuard([])
      const context = createMockContext({ headers: {} })

      expect(guard.canActivate(context)).toBe(true)
    })
  })

  describe('when roles are required', () => {
    it('allows access when user has the required role', () => {
      const guard = createGuard([AppRole.Admin])
      const user = createUser({ roles: ['Admin'] })
      const context = createMockContext({ headers: {}, user })

      expect(guard.canActivate(context)).toBe(true)
    })

    it('allows access when user has one of multiple required roles', () => {
      const guard = createGuard([AppRole.Admin, AppRole.User])
      const user = createUser({ roles: ['User'] })
      const context = createMockContext({ headers: {}, user })

      expect(guard.canActivate(context)).toBe(true)
    })

    it('throws ForbiddenException when user lacks required role', () => {
      const guard = createGuard([AppRole.Admin])
      const user = createUser({ roles: ['User'] })
      const context = createMockContext({ headers: {}, user })

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
    })

    it('throws ForbiddenException with generic message (no role leakage)', () => {
      const guard = createGuard([AppRole.Admin])
      const user = createUser({ roles: ['User'] })
      const context = createMockContext({ headers: {}, user })

      try {
        guard.canActivate(context)
        fail('Expected ForbiddenException')
      } catch (error) {
        expect(error.message).toBe('Insufficient permissions')
        expect(error.message).not.toContain('Admin')
      }
    })

    it('throws UnauthorizedException when no user in production', () => {
      const guard = createGuard([AppRole.Admin], { NODE_ENV: 'production' })
      const context = createMockContext({ headers: {} })

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    })
  })

  describe('development bypass', () => {
    it('allows access in development when AUTH_ENABLED is not true', () => {
      const guard = createGuard([AppRole.Admin], { NODE_ENV: 'development' })
      const context = createMockContext({ headers: {} })

      expect(guard.canActivate(context)).toBe(true)
    })

    it('throws UnauthorizedException in development when AUTH_ENABLED is true', () => {
      const guard = createGuard([AppRole.Admin], {
        NODE_ENV: 'development',
        AUTH_ENABLED: 'true',
      })
      const context = createMockContext({ headers: {} })

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    })

    it('does not bypass in production even when AUTH_ENABLED is false', () => {
      const guard = createGuard([AppRole.Admin], {
        NODE_ENV: 'production',
        AUTH_ENABLED: 'false',
      })
      const context = createMockContext({ headers: {} })

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    })
  })
})
