import { Logger } from '@nestjs/common'
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { settings } from 'src/settings'

@WebSocketGateway({
  namespace: 'realtime',
  cors: {
    origin: settings.frontendLink,
    credentials: true
  }
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name)

  @WebSocketServer()
  server: Server

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`)
  }

  emit(event: string, payload: Record<string, unknown>): void {
    this.server.emit(event, payload)
  }
}
