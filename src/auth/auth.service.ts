import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Dto } from 'src/dto'
import { UsersService } from 'src/users/users.service'
import { AuthJwtPayload } from './types/auth.jwtPayload'
import { UniqueConstraintError } from 'sequelize'

@Injectable()
export class AuthService {
  @Inject()
  private readonly usersService: UsersService

  @Inject()
  private readonly jwtService: JwtService

  async validateGoogleUser(googleUser: Dto.Users.CreateUserDto) {
    const email = googleUser.email.trim().toLowerCase()
    const normalizedGoogleUser = {
      ...googleUser,
      email
    }

    const user = await this.usersService.findByEmail(email)
    if (user) return user

    try {
      return await this.usersService.create(normalizedGoogleUser)
    } catch (error) {
      // Prevent sporadic 500 on concurrent first-login attempts for same email.
      if (error instanceof UniqueConstraintError) {
        const existingUser = await this.usersService.findByEmail(email)
        if (existingUser) return existingUser
      }
      throw error
    }
  }

  async login(userId: string) {
    const user = await this.usersService.findOne(userId)
    const payload: AuthJwtPayload = { sub: { id: user.id, role: user.role, groupId: user.groupId } }
    return this.jwtService.sign(payload)
  }
}
