import { Controller, Get, Req } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuth } from 'src/decorators'
import { User } from 'src/decorators/user.decorator'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @JwtAuth()
  async getCurrentUser(@User() user: any) {
    return this.usersService.findOne(user.id)
  }
}
