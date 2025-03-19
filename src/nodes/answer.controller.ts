import { Controller, Get, Post, Body, ValidationPipe, Query, Patch, UsePipes } from '@nestjs/common'
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getAllnswers(@Query() query: Dto.Answers.AnswerListQuery) {
    console.log('query:', query)
    return this.answerService.getAllAnswers(query)
  }

  @Auth()
  @Post()
  giveAnswer(@Body(ValidationPipe) giveAnswerDto: Dto.Answers.AddAnswerDto, @User() user) {
    return this.answerService.giveAnswer(giveAnswerDto, user)
  }

  @AdminAuth()
  @Patch('/evaluate')
  evaluateAnswers(@Body(ValidationPipe) evaluateAnswersDto: Dto.Answers.EvaluateAnswerDto[]) {
    return this.answerService.evaluateAnswers(evaluateAnswersDto)
  }
}
