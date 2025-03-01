import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { Dto } from 'src/dto'
import { Pto } from '@rtx/types'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() createGroupDto: Dto.Groups.CreateGroupDto) {
    return await this.groupsService.create(createGroupDto)
  }

  @Get()
  async findAll(): Promise<Pto.Groups.GroupList> {
    return await this.groupsService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.groupsService.findOne(id)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGroupDto: Dto.Groups.UpdateGroupDto) {
    return await this.groupsService.update(id, updateGroupDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.groupsService.remove(id)
  }
}
