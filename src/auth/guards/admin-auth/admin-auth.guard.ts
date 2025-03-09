import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Pto } from '@rtx/types'
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload'

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

    if (user.role !== Pto.Users.UserRole.Admin) {
      throw new UnauthorizedException('Only admins can access this resource')
    }
    return user
  }
}
