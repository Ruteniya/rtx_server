import { LoggerService, LogLevel } from '@nestjs/common'
import { settings } from 'src/settings'

const { env } = settings

const defaultColor = ''
const logColor = env.isDevelopment ? '\x1b[92m' : defaultColor
const errorColor = env.isDevelopment ? '\x1b[91m' : defaultColor
const warnColor = env.isDevelopment ? '\x1b[93m' : defaultColor
const debugColor = env.isDevelopment ? '\x1b[94m' : defaultColor

const getMessageConfig = (...args: any) => {
  let messageConfig = '%s%s %s'

  args.forEach((argument: any) => {
    const type = typeof argument
    switch (type) {
      case 'bigint':
      case 'number':
      case 'boolean':
        messageConfig += '%d '
        break

      case 'string':
        messageConfig += '%s '
        break

      case 'object':
      case 'undefined':
      default:
        messageConfig += '%o '
    }
  })

  messageConfig += '%s'

  return messageConfig
}

export class CustomLogger implements LoggerService {
  private name: string
  private isLogLevel: boolean
  private isErrorLevel: boolean
  private isWarnLevel: boolean
  private isDebugLevel: boolean

  constructor(name: string) {
    this.name = name
    this.setLogLevels(settings.logger.levels)
  }

  /**
   * Write a 'log' level log.
   */
  log = (message: any, ...optionalParams: any[]) => {
    if (this.isLogLevel) {
      const messageConfig = getMessageConfig(message, ...optionalParams)
      console.log(messageConfig, warnColor, `[${this.name}]`, logColor, message, ...optionalParams, defaultColor)
    }
  }

  /**
   * Write an 'error' level log.
   */
  error = (message: any, ...optionalParams: any[]) => {
    if (this.isErrorLevel) {
      const messageConfig = getMessageConfig(message, ...optionalParams)
      console.error(messageConfig, warnColor, `[${this.name}]`, errorColor, message, ...optionalParams, defaultColor)
    }
  }

  /**
   * Write a 'warn' level log.
   */
  warn = (message: any, ...optionalParams: any[]) => {
    if (this.isWarnLevel) {
      const messageConfig = getMessageConfig(message, ...optionalParams)
      console.warn(messageConfig, warnColor, `[${this.name}]`, warnColor, message, ...optionalParams, defaultColor)
    }
  }

  /**
   * Write a 'debug' level log.
   */
  debug = (message: any, ...optionalParams: any[]) => {
    if (this.isDebugLevel) {
      const messageConfig = getMessageConfig(message, ...optionalParams)
      console.debug(messageConfig, warnColor, `[${this.name}]`, debugColor, message, ...optionalParams, defaultColor)
    }
  }

  setLogLevels = (levels: LogLevel[]) => {
    this.isLogLevel = levels.includes('log')
    this.isErrorLevel = levels.includes('error')
    this.isWarnLevel = levels.includes('warn')
    this.isDebugLevel = levels.includes('debug')
  }
}
