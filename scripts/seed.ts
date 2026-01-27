import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { Seeder } from 'src/seeder/seeder'

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const seedService = app.get(Seeder)

  await seedService.createSeedData()
  await app.close()
}

seed()
