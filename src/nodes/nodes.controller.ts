import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  UseInterceptors,
  UploadedFiles,
  Put,
  Query
} from '@nestjs/common'
import { NodesService } from './nodes.service'
import { Dto } from 'src/dto'
import { AdminAuth, Auth, SystemAuth, User } from 'src/decorators'
import { GamesService } from 'src/games/games.service'
import { Response } from 'express'
import { Pto } from 'rtxtypes'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Multer } from 'multer'
import { GroupsService } from 'src/groups/groups.service'

@Controller('nodes')
export class NodesController {
  constructor(
    private readonly nodesService: NodesService,
    private readonly gamesService: GamesService,
    private readonly groupsService: GroupsService
  ) {}

  @SystemAuth()
  @Post()
  @UseInterceptors(FilesInterceptor('files', 2))
  create(@UploadedFiles() files: Multer.File[], @Body() createNodeDto: Dto.Nodes.CreateNodeDto) {
    const questionImageFile = files?.find((f) => f.originalname === 'questionImage')
    const correctAnswerFile = files?.find((f) => f.originalname === 'correctAnswer')

    return this.nodesService.createNode(createNodeDto, questionImageFile, correctAnswerFile)
  }

  @Auth()
  @Get('small')
  async findAllSmallVersion(@Res() res: Response, @User() user, @Query() options: Pto.Nodes.NodesListQuery) {
    const extraOptions = {}
    if (user.role == Pto.Users.UserRole.User) {
      await this.gamesService.checkGameTime(false)

      const group = await this.groupsService.findOne(user.groupId)

      extraOptions['categoryIds'] = [group.categoryId]
    }

    const nodes = await this.nodesService.findAllNodesSmall({ ...options, ...extraOptions })
    return res.json(nodes)
  }

  @Auth()
  @Get('short')
  async findAllShortVersion(@User() user) {
    if (user.role == Pto.Users.UserRole.User) await this.gamesService.checkGameTime()

    return this.nodesService.findAllNodesShort()
  }

  @AdminAuth()
  @Get()
  findAll() {
    return this.nodesService.findAllNodes()
  }

  @Auth()
  @Get('short/:id')
  async findShortOne(@Param('id') id: string, @User() user) {
    if (user.role == Pto.Users.UserRole.User) await this.gamesService.checkGameTime(false)

    return this.nodesService.findShortNode(id)
  }

  @AdminAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodesService.findNode(id)
  }

  @SystemAuth()
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 2))
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Multer.File[],
    @Body() updateNodeDto: Dto.Nodes.UpdateNodeDto,
    @Query() options: Dto.Nodes.UpdateNodeOptionsDto
  ) {
    const questionImageFile = files?.find((f) => f.originalname === 'questionImage')
    const correctAnswerFile = files?.find((f) => f.originalname === 'correctAnswer')

    return this.nodesService.updateNode(id, updateNodeDto, questionImageFile, correctAnswerFile, options)
  }

  @SystemAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodesService.removeNode(id)
  }
}
