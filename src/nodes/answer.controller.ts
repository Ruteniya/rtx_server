import { Controller, Get, Post, Body, ValidationPipe, Query } from '@nestjs/common'
import { Dto } from 'src/dto'
import { AdminAuth, Auth, User } from 'src/decorators'
import { JwtUser } from 'src/auth/types/auth.jwtPayload'
import { AnswersService } from './answers.service'
import { Pto } from '@rtx/types'

@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswersService) {}

  @Auth()
  @Get()
  getAnswers(@User() user: JwtUser) {
    return this.answerService.getAnswers(user.groupId)
  }

  @AdminAuth()
  @Get('/all')
  getAllnswers(@Query() query: Pto.Answers.AnswerListQuery) {
    return this.answerService.getAllAnswers(query)
  }

  @Auth()
  @Post()
  giveAnswer(@Body(ValidationPipe) giveAnswerDto: Dto.Answers.AddAnswerDto, @User() user) {
    return this.answerService.giveAnswer(giveAnswerDto, user)
  }
}
