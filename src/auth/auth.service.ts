import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Dto } from 'src/dto'
import { UsersService } from 'src/users/users.service'
import { AuthJwtPayload } from './types/auth.jwtPayload'
import { Pto } from '@rtx/types'

@Injectable()
export class AuthService {
  @Inject()
  private readonly usersService: UsersService

  @Inject()
  private readonly jwtService: JwtService

  async validateGoogleUser(googleUser: Dto.Users.CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email)
    if (user) return user
    return await this.usersService.create(googleUser)
  }

  async login(userId: string) {
    const user = await this.usersService.findOne(userId)
    const payload: AuthJwtPayload = { sub: { id: user.id, role: user.role, groupId: user.groupId } }
    return this.jwtService.sign(payload)
  }
}
