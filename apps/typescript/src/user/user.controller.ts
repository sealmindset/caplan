import { Controller, Get } from '@nestjs/common'
import { CurrentUser, AppUser } from '../auth'

@Controller('me')
export class UserController {
  @Get()
  getCurrentUser(@CurrentUser() user: AppUser | null) {
    if (!user) {
      return { name: 'Anonymous', email: '', roles: [] }
    }
    return {
      name: user.name,
      email: user.email,
      roles: user.roles,
    }
  }
}
