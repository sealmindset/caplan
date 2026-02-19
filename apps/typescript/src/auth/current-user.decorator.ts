import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AppUser } from './entra-id-principal.interface'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppUser | null => {
    const request = ctx.switchToHttp().getRequest()
    return request.user ?? null
  },
)
