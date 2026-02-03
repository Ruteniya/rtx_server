import { Controller, Get, Post, Query } from '@nestjs/common'
import { ResultsService } from './results.service'

import { AdminAuth, SystemAuth } from 'src/decorators'
import { Dto } from 'src/dto'

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @SystemAuth()
  @Post()
  generateResults() {
    return this.resultsService.generateResults()
  }

  @AdminAuth()
  @Get()
  findAll(@Query() query: Dto.Results.ResultsListQueryDto) {
    return this.resultsService.findAll(query)
  }

  @AdminAuth()
  @Get('export/csv')
  exportCsv(): Promise<{ url: string }> {
    return this.resultsService.exportResultsCsv()
  }
}
