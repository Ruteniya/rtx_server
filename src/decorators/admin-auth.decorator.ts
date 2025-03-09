import { applyDecorators, UseGuards } from '@nestjs/common'
import { AdminAuthGuard } from 'src/auth/guards/admin-auth/admin-auth.guard'
export function AdminAuth(): ReturnType<typeof applyDecorators> {
  return applyDecorators(UseGuards(AdminAuthGuard))
}
