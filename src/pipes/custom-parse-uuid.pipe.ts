import { Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { ParseUUIDPipe } from '@nestjs/common'
import { Pto } from 'rtxtypes'

@Injectable()
export class CustomParseUUIDPipe extends ParseUUIDPipe {
  constructor() {
    super({
      exceptionFactory: (_) => {
        return new BadRequestException(Pto.Errors.Messages.INVALID_UUID)
      }
    })
  }

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata && metadata.type === 'param' && metadata.data?.includes('id')) {
      return super.transform(value, metadata)
    }

    return value
  }
}
