import { Injectable } from '@nestjs/common'
import { RealtimeGateway } from './realtime.gateway'

@Injectable()
export class RealtimeService {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  emitResultsGenerated(): void {
    this.realtimeGateway.emit('results.generated', {
      emittedAt: new Date().toISOString()
    })
  }
}
