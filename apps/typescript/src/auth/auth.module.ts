import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthMiddleware } from './auth.middleware'
import { PrincipalParserService } from './principal-parser.service'
import { RolesGuard } from './roles.guard'

@Module({
  providers: [
    PrincipalParserService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [PrincipalParserService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }
}
