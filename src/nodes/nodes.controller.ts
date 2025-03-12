import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { NodesService } from './nodes.service'
import { Dto } from 'src/dto'
import { AdminAuth, Auth, SystemAuth } from 'src/decorators'

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @SystemAuth()
  @Post()
  create(@Body() createNodeDto: Dto.Nodes.CreateNodeDto) {
    return this.nodesService.create(createNodeDto)
  }

  @Auth()
  @Get()
  findAllShortVersion() {
    return this.nodesService.findAll()
  }

  @AdminAuth()
  @Get()
  findAll() {
    return this.nodesService.findAll()
  }

  @AdminAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodesService.findOne(id)
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateNodeDto: Dto.Nodes.UpdateNodeDto) {
  //   return this.nodesService.update(+id, updateNodeDto);
  // }

  @SystemAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodesService.remove(id)
  }
}
