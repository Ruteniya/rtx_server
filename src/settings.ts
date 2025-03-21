import * as dotenv from 'dotenv'
import { Dialect } from 'sequelize'
import * as process from 'node:process'

dotenv.config()

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose'

const stage = process.env.NODE_ENV
const env = {
  isDevelopment: stage === 'development',
  isStaging: stage === 'staging',
  isProduction: stage === 'production',
  isTest: stage === 'test'
}

export const postgresSettings = {
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  database: process.env.DATABASE_NAME || 'rtx',
  username: process.env.DATABASE_USER || 'rtx',
  password: process.env.DATABASE_PASSWORD || 'password',
  host: process.env.DATABASE_HOST || 'localhost',
  dialect: 'mariadb' as Dialect,
  logging: console.log,
  ssl: false
}

export const settings = {
  env,
  appName: 'rtx-backend',
  port: parseInt(process.env.PORT || '4444'),
  logger: {
    levels: env.isTest ? [] : (['error', 'warn', 'log'] as LogLevel[]),
    suppressDebug: process.env.SUPPRESS_DEBUG_LOGS
  },
  database: postgresSettings,
  apiBodySize: 52428800,
  frontendFiles: process.env.PATH_TO_FRONTEND_FILES || '../../../rtx_client/dist',
  frontendLink: process.env.FRONTEND_LINK || 'http://localhost:4496',
  backendLink: process.env.BACKEND_LINK || 'http://localhost:4496',
  assets: {},
  googleOAuth: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'secret',
    accessExpiresIn: process.env.JWT_EXPIRE_IN,
    cookieExpiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days in miliseconds
  }
}

if (!settings.logger.suppressDebug) {
  settings.logger.levels.push('debug')
}
