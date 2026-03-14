import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { Dto } from 'src/dto'
import { Pto } from 'rtxtypes'
import { AdminAuth, SystemAuth } from 'src/decorators'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @AdminAuth()
  @Get()
  async findAll(@Query() query: Pto.Groups.GroupsListQuery): Promise<Pto.Groups.GroupList> {
    return this.groupsService.findAll(query)
  }

  @AdminAuth()
  @Get('/export/csv')
  async exportCsv(): Promise<Pto.App.File> {
    return this.groupsService.exportGroupsCsv()
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
  @Post('bulk')
  async bulkCreate(@Body() dto: Dto.Groups.CreateGroupFromCsvDto) {
    return this.groupsService.bulkCreateFromCsv(dto.groups)
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

  @SystemAuth()
  @Post('bulk-delete')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async bulkRemove(@Body() dto: Dto.Groups.BulkDeleteGroupsDto) {
    return this.groupsService.bulkRemove(dto.groupIds)
  }

  @SystemAuth()
  @Post('send-emails')
  async sendEmails(@Body() dto: Dto.Groups.SendEmailsDto) {
    return this.groupsService.sendGroupCodeEmails(dto.groupIds)
  }
}
