import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { AppRole } from './app-role.enum'
import { AppUser } from './entra-id-principal.interface'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user: AppUser | undefined = request.user

    if (!user) {
      if (this.isDevBypass()) {
        return true
      }
      throw new UnauthorizedException('Authentication required')
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role))

    if (!hasRole) {
      this.logger.warn(
        `Access denied for user ${user.objectId}. Required: [${requiredRoles.join(', ')}], has: [${user.roles.join(', ')}]`,
      )
      throw new ForbiddenException('Insufficient permissions')
    }

    return true
  }

  private isDevBypass(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV')
    const authEnabled = this.configService.get<string>('AUTH_ENABLED')
    return nodeEnv === 'development' && authEnabled !== 'true'
  }
}
