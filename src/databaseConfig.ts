import * as dotenv from 'dotenv'
dotenv.config()

const development = {
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  database: process.env.DATABASE_NAME || 'rtx',
  username: process.env.DATABASE_USER || 'rtx',
  password: process.env.DATABASE_PASSWORD || 'password',
  host: process.env.DATABASE_HOST || 'localhost',
  dialect: 'postgres' as const,
  logging: console.log,
  ssl: false
}

const production = process.env.DATABASE_URL
  ? {
      url: process.env.DATABASE_URL,
      dialect: 'postgres' as const,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  : development

module.exports = { development, production }
