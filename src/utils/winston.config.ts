import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston'
import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { settings } from 'src/settings'

const logDir = process.env.LOG_DIRECTORY || './logs'
const isProduction = settings.env.isProduction

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Console transport - JSON in production for better log aggregation, colored in dev
    new winston.transports.Console({
      format: isProduction
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            nestWinstonModuleUtilities.format.nestLike(settings.appName, {
              prettyPrint: true
            })
          )
    }),

    // Daily rotate file transport for all logs (only if LOG_DIRECTORY is set)
    ...(process.env.LOG_DIRECTORY
      ? [
          new DailyRotateFile({
            dirname: logDir,
            filename: 'application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            )
          })
        ]
      : []),

    // Error logs in separate file (only if LOG_DIRECTORY is set)
    ...(process.env.LOG_DIRECTORY
      ? [
          new DailyRotateFile({
            dirname: logDir,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            ),
            level: 'error'
          })
        ]
      : [])
  ]
}
