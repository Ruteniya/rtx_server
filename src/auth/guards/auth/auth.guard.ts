import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class CustomAuthGuard extends AuthGuard('jwt') {
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

    if (!user.groupId) {
      throw new ForbiddenException('Forbidden. Please select a group')
    }

    return user
  }
}
