import { Controller, Get, Post, Param, UseGuards, Req, Res, Query } from '@nestjs/common'
import { AuthService } from './auth.service'
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard'
import { Pto } from 'rtxtypes'
import { CookieOptions, Response } from 'express'
import { UsersService } from 'src/users/users.service'
import { settings } from 'src/settings'
import { JwtAuth, User } from 'src/decorators'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res): Promise<void> {
    const user = req.user as Pto.Users.User
    const accessToken = await this.authService.login(user.id)
    this.setTokenToCookie(res, accessToken)

    const groupId = user.groupId || null

    const redirectUrl = new URL(settings.frontendLink)
    redirectUrl.searchParams.append('userId', user.id)
    if (groupId) {
      redirectUrl.searchParams.append('groupId', groupId)
    }

    return res.redirect(redirectUrl.toString())
  }

  @JwtAuth()
  @Post('group/login/:groupId')
  async loginToGroup(@User() user, @Param('groupId') groupId: string, @Res() res): Promise<Pto.Users.User> {
    const returnedUser = await this.usersService.addToGroup(user.id, groupId)
    const accessToken = await this.authService.login(returnedUser.id)

    this.setTokenToCookie(res, accessToken)
    return res.json(returnedUser)
  }
  
  @JwtAuth()
  @Post('logout')
  async logout(@Res() res): Promise<void> {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: settings.env.isProduction ? 'lax' : 'none' as const,
      domain: settings.env.isProduction ? '.ruteniya.space' : undefined,
      maxAge: 0
    })
    res.status(200).json({ message: 'Logout successful' })
  }

  private setTokenToCookie(res: Response, accessToken: string) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true, // Завжди true, бо на Railway/Vercel є SSL
      sameSite: settings.env.isProduction ? 'lax' : 'none' as const,
      maxAge: settings.jwt.cookieExpiresIn,
      path: '/', 
      domain: settings.env.isProduction ? '.ruteniya.space' : undefined,
    }
    res.cookie('access_token', accessToken, cookieOptions)
  }
}