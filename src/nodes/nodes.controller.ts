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
    return this.nodesService.createNode(createNodeDto)
  }

  @Auth()
  @Get('short')
  findAllShortVersion() {
    return this.nodesService.findAllNodesShort()
  }

  @AdminAuth()
  @Get()
  findAll() {
    return this.nodesService.findAllNodes()
  }

  @AdminAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodesService.findNode(id)
  }

  @AdminAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeDto: Dto.Nodes.UpdateNodeDto) {
    return this.nodesService.updateNode(id, updateNodeDto)
  }

  @SystemAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodesService.removeNode(id)
  }
}
