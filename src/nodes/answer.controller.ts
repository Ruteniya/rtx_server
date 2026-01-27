import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Query,
  Patch,
  UsePipes,
  Res,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common'
import { Dto } from 'src/dto'
import { AdminAuth, Auth, User } from 'src/decorators'
import { JwtUser } from 'src/auth/types/auth.jwtPayload'
import { AnswersService } from './answers.service'
import { GamesService } from 'src/games/games.service'
import { Response } from 'express'
import { Pto } from 'rtxtypes'
import { FileInterceptor } from '@nestjs/platform-express'
import { Multer } from 'multer'

@Controller('answers')
export class AnswerController {
  constructor(
    private readonly answerService: AnswersService,
    private readonly gamesService: GamesService
  ) {}

  @Auth()
  @Get()
  async getAnswers(@User() user: JwtUser) {
    if (user.role == Pto.Users.UserRole.User) await this.gamesService.checkGameTime(false)
    return this.answerService.getAnswers(user.groupId)
  }

  @Auth()
  @Get('/small')
  async getAnswersSmallVersion(@Res() res: Response, @User() user) {
    if (user.role == Pto.Users.UserRole.User) await this.gamesService.checkGameTime(false)

    const answers = await this.answerService.getAnswersSmall(user.groupId)
    return res.json(answers)
  }

  @Auth()
  @Get('/full/:id')
  async getAnswer(@Param('id') answerId, @User() user) {
    if (user.role == Pto.Users.UserRole.User) await this.gamesService.checkGameTime(false)

    return this.answerService.getAnswer(answerId, user.groupId)
  }

  @AdminAuth()
  @Get('/all')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getAllnswers(@Query() query: Dto.Answers.AnswerListQuery) {
    return this.answerService.getAllAnswers(query)
  }

  @Auth()
  @Post()
  @UseInterceptors(FileInterceptor('answerFile'))
  async giveAnswer(
    @Body(ValidationPipe) giveAnswerDto: Dto.Answers.AddAnswerDto,
    @User() user,
    @UploadedFile() answerFile?: Multer.File
  ) {
    if (user.role == Pto.Users.UserRole.User) await this.gamesService.checkGameTime(true)

    if (!answerFile && !giveAnswerDto.answerValue) {
      throw new BadRequestException('Either answerValue or answerFile must be provided')
    }

    return this.answerService.giveAnswer(giveAnswerDto, user, answerFile)
  }

  @AdminAuth()
  @Patch('/evaluate')
  evaluateAnswers(@Body(ValidationPipe) evaluateAnswersDto: Dto.Answers.EvaluateAnswerDto[]) {
    return this.answerService.evaluateAnswers(evaluateAnswersDto)
  }
}
