import { applyDecorators, UseGuards } from '@nestjs/common'
import { SystemAuthGuard } from 'src/auth/guards/system-auth/system-auth.guard'
export function SystemAuth(): ReturnType<typeof applyDecorators> {
  return applyDecorators(UseGuards(SystemAuthGuard))
}
