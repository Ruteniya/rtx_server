import { Injectable, UnauthorizedException } from '@nestjs/common'
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

  authorizationParams(options: any): object {
    return {
      ...options,
      prompt: 'select_account'
    }
  }
  async validate(_: string, __: string, profile: any, done: VerifyCallback) {
    const email = profile?.emails?.[0]?.value?.trim()?.toLowerCase()
    if (!email) {
      return done(new UnauthorizedException('Google account does not provide an email'), false)
    }

    const firstName = profile?.name?.givenName || profile?.displayName || 'Google'
    const lastName = profile?.name?.familyName || '-'

    const user = await this.authService.validateGoogleUser({ email, firstName, lastName })
    done(null, user)
  }
}
