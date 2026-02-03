import { Controller, Get, Post, Query } from '@nestjs/common'
import { ResultsService } from './results.service'

import { AdminAuth, SystemAuth } from 'src/decorators'
import { Dto } from 'src/dto'
import { CustomLogger } from 'src/utils'

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService, private readonly logger: CustomLogger) {}

  @SystemAuth()
  @Post()
  generateResults() {
    this.logger.log('Generating results')
    return this.resultsService.generateResults()
  }

  @AdminAuth()
  @Get()
  findAll(@Query() query: Dto.Results.ResultsListQueryDto) {
    this.logger.log('Finding all results', query)
    return this.resultsService.findAll(query)
  }

  @AdminAuth()
  @Get('export/csv')
  exportCsv(): Promise<{ url: string }> {
    this.logger.log('Starting results CSV export')
    return this.resultsService.exportResultsCsv()
  }
}
