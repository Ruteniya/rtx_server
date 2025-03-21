import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Pto } from 'rtxtypes'

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super()
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as Promise<boolean>
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException(info)
    }

    if (![Pto.Users.UserRole.Admin, Pto.Users.UserRole.SystemAdmin].includes(user.role)) {
      throw new UnauthorizedException(Pto.Errors.Messages.ACCESS_FORBIDDEN)
    }
    return user
  }
}
