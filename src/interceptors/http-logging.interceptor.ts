import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request, Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const { method, url, body, query, params, ip, headers } = request
    const userAgent = headers['user-agent'] || ''
    const startTime = Date.now()

    // Log request
    this.logger.info({
      message: `Incoming ${method} ${url}`,
      method,
      url,
      query: Object.keys(query).length > 0 ? query : undefined,
      params: Object.keys(params).length > 0 ? params : undefined,
      body: this.sanitizeBody(body),
      ip,
      userAgent,
      userId: (request as any).user?.id
    })

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime
          const statusCode = response.statusCode

          // Log response
          this.logger.info({
            message: `Outgoing ${method} ${url} ${statusCode}`,
            method,
            url,
            statusCode,
            duration: `${duration}ms`
          })
        },
        error: (error) => {
          const duration = Date.now() - startTime
          const statusCode = error.status || 500

          // Log error
          this.logger.error({
            message: `Error ${method} ${url} ${statusCode}`,
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: {
              name: error.name,
              message: error.message,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
          })
        }
      })
    )
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'cookie']
    const sanitized = { ...body }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }
}
