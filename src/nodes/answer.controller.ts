import { Controller, Get, Post, Body, ValidationPipe, Query, Patch, UsePipes } from '@nestjs/common'
import { Dto } from 'src/dto'
import { AdminAuth, Auth, User } from 'src/decorators'
import { JwtUser } from 'src/auth/types/auth.jwtPayload'
import { AnswersService } from './answers.service'
import { GamesService } from 'src/games/games.service'

@Controller('answers')
export class AnswerController {
  constructor(
    private readonly answerService: AnswersService,
    private readonly gamesService: GamesService
  ) {}

  @Auth()
  @Get()
  async getAnswers(@User() user: JwtUser) {
    await this.gamesService.checkGameTime()
    return this.answerService.getAnswers(user.groupId)
  }

  @AdminAuth()
  @Get('/all')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getAllnswers(@Query() query: Dto.Answers.AnswerListQuery) {
    return this.answerService.getAllAnswers(query)
  }

  @Auth()
  @Post()
  async giveAnswer(@Body(ValidationPipe) giveAnswerDto: Dto.Answers.AddAnswerDto, @User() user) {
    await this.gamesService.checkGameTime(true)

    return this.answerService.giveAnswer(giveAnswerDto, user)
  }

  @AdminAuth()
  @Patch('/evaluate')
  evaluateAnswers(@Body(ValidationPipe) evaluateAnswersDto: Dto.Answers.EvaluateAnswerDto[]) {
    return this.answerService.evaluateAnswers(evaluateAnswersDto)
  }
}
