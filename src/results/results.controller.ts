import { Controller, Get, Post } from '@nestjs/common'
import { ResultsService } from './results.service'

import { AdminAuth, SystemAuth } from 'src/decorators'

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
  findAll() {
    return this.resultsService.findAll()
  }
}
