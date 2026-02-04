import helmet from 'helmet'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe, LoggerService } from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { settings } from './settings'
import { AppModule } from './app.module'
import { CustomParseUUIDPipe } from './pipes/custom-parse-uuid.pipe'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER)
  app.useLogger(logger)
  app.use(cookieParser())

  app.enableCors({
    origin: settings.frontendLink,
    credentials: true
  })

  app.useGlobalPipes(new CustomParseUUIDPipe())

  try {
    await configure(app, logger)

    const { port } = settings

    await app.listen(port, () => {
      logger.log(`App started at ${port} port`)
      logger.log(`[NOD] ${process.version}`)
      logger.log(`[ENV] ${process.env.NODE_ENV}`)
      logger.log(`[DKR] ${process.env.IS_DOCKER ? true : false}`)
    })
  } catch (exception) {
    logger.error('Exception', exception)
    throw exception
  }
}

export const configure = async (app: NestExpressApplication, logger: LoggerService): Promise<void> => {
  // app.useStaticAssets(path.join(__dirname, settings.frontendFiles))

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.useBodyParser('json', { limit: settings.apiBodySize })
  app.useBodyParser('urlencoded', { limit: settings.apiBodySize, extended: true })
  app.use(helmet())

  app.enableShutdownHooks()

  await app.startAllMicroservices()

  logger.log('All services initialized')
}

void bootstrap()
