import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { GoogleStrategy } from './strategies/google.strategy'
import { JwtModule } from '@nestjs/jwt'
import { settings } from 'src/settings'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: settings.jwt.accessSecret,
      signOptions: {
        expiresIn: settings.jwt.accessExpiresIn
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy]
})
export class AuthModule {}
