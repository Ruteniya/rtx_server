import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'
import { settings } from 'src/settings'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: settings.googleOAuth.clientID ?? '',
      clientSecret: settings.googleOAuth.clientSecret ?? '',
      callbackURL: settings.googleOAuth.callbackURL ?? '',
      scope: ['email', 'profile']
    })
  }

  async validate(_: string, __: string, profile: any, done: VerifyCallback) {
    const firstName = profile.name.givenName
    const lastName = profile.name.familyName
    const email = profile.emails && profile.emails[0].value

    const user = await this.authService.validateGoogleUser({ email, firstName, lastName })
    done(null, user)
  }
}
