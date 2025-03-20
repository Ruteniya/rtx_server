import { Body, Controller, ForbiddenException, Get, Param, Patch, Query, Req, ValidationPipe } from '@nestjs/common'
import { UsersService } from './users.service'
import { AdminAuth, JwtAuth, SystemAuth } from 'src/decorators'
import { User } from 'src/decorators/user.decorator'
import { Dto } from 'src/dto'
import { JwtUser } from 'src/auth/types/auth.jwtPayload'
import { Pto } from '@rtx/types'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @JwtAuth()
  async getCurrentUser(@User() user: JwtUser) {
    return this.usersService.findOne(user.id)
  }

  @AdminAuth()
  @Get('all')
  async getAllUsers(@Query() query: Pto.Users.UsersListQuery) {
    return this.usersService.getAll(query)
  }

  @Patch(':userId')
  @SystemAuth()
  async changeUserRole(
    @Param('userId') userId: string,
    @Body(ValidationPipe) changeUserRoleDto: Dto.Users.ChangeUserRole,
    @User() user: JwtUser
  ) {
    if (user.id == userId) throw new ForbiddenException(Pto.Errors.Messages.YOU_CANNOT_UPATE_YOUR_OWN_ROLE)
    return this.usersService.changeUserRole(userId, changeUserRoleDto.role)
  }
}
