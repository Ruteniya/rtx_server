import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload'

export const User = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthJwtPayload => {
  const request = ctx.switchToHttp().getRequest()
  return request.user as AuthJwtPayload
})
