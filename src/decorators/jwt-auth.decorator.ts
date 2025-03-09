import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard'

export function JwtAuth(): ReturnType<typeof applyDecorators> {
  return applyDecorators(UseGuards(JwtAuthGuard))
}
