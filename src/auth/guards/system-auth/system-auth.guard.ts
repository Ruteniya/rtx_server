import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Pto } from '@rtx/types'

@Injectable()
export class SystemAuthGuard extends AuthGuard('jwt') {
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

    if (user.role !== Pto.Users.UserRole.SystemAdmin) {
      throw new UnauthorizedException(Pto.Errors.Messages.ACCESS_FORBIDDEN)
    }
    return user
  }
}
