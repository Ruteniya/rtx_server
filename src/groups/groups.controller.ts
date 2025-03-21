import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { Dto } from 'src/dto'
import { Pto } from 'rtxtypes'
import { AdminAuth, SystemAuth } from 'src/decorators'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @AdminAuth()
  @Get()
  async findAll(): Promise<Pto.Groups.GroupList> {
    return this.groupsService.findAll()
  }

  @AdminAuth()
  @Get('/populated/:id')
  async findPopulatedOne(@Param('id') id: string) {
    return this.groupsService.findPopulatedOne(id)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id)
  }

  @SystemAuth()
  @Post()
  async create(@Body() createGroupDto: Dto.Groups.CreateGroupDto) {
    return this.groupsService.create(createGroupDto)
  }

  @SystemAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGroupDto: Dto.Groups.UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto)
  }

  @SystemAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.groupsService.remove(id)
  }
}
