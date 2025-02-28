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

const dialectOptions = !env.isDevelopment
  ? {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  : {}

export const postgresSettings = {
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'rtx',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  host: process.env.DATABASE_HOST || 'localhost',
  dialect: 'postgres' as Dialect,
  logging: env.isDevelopment ? console.log : false,
  ...dialectOptions
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
  frontendLink: process.env.FRONTEND_LINK || 'http://localhost:3000',
  backendLink: process.env.BACKEND_LINK || 'http://localhost:4496',
  assets: {
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    accessExpiresIn: '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: '30d'
  }
}

if (!settings.logger.suppressDebug) {
  settings.logger.levels.push('debug')
}

