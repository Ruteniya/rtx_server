import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { Dto } from 'src/dto'
import { Pto } from '@rtx/types'
import { AdminAuth, SystemAuth } from 'src/decorators'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @SystemAuth()
  @Post()
  async create(@Body() createGroupDto: Dto.Groups.CreateGroupDto) {
    return await this.groupsService.create(createGroupDto)
  }

  @AdminAuth()
  @Get()
  async findAll(): Promise<Pto.Groups.GroupList> {
    return await this.groupsService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.groupsService.findOne(id)
  }

  @SystemAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGroupDto: Dto.Groups.UpdateGroupDto) {
    return await this.groupsService.update(id, updateGroupDto)
  }

  @SystemAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.groupsService.remove(id)
  }
}
