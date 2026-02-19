import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api{/*path}', '/health{/*path}'],
    }),
    HealthModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
