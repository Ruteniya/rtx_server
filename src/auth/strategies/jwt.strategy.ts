import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { settings } from 'src/settings'
import { AuthJwtPayload } from '../types/auth.jwtPayload'
import { ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.access_token]),
      secretOrKey: settings.jwt.accessSecret
    })
  }

  validate(payload: AuthJwtPayload) {
    return payload.sub
  }
}
