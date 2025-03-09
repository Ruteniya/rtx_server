import { applyDecorators, UseGuards } from '@nestjs/common'
import { CustomAuthGuard } from 'src/auth/guards/auth/auth.guard'
export function Auth(): ReturnType<typeof applyDecorators> {
  return applyDecorators(UseGuards(CustomAuthGuard))
}
