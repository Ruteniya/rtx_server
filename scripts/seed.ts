// import { NestFactory } from '@nestjs/core'
// import { AppModule } from '../src/app.module' // Adjust based on your project structure
// import { UsersService } from '../src/users/users.service'
// import { GroupsService } from '../src/groups/groups.service' // Сервіс для роботи з групами
// import { CategoriesService } from '../src/categories/categories.service' // Сервіс для роботи з категоріями
// import { Logger } from '@nestjs/common'

// async function seed() {
//   const app = await NestFactory.createApplicationContext(AppModule)
//   const usersService = app.get(UsersService)
//   const groupsService = app.get(GroupsService)
//   const categoriesService = app.get(CategoriesService) // Додаємо сервіс для категорій
//   const logger = new Logger('Seeder')

//   try {
//     // Створюємо категорію "Провід", якщо її ще немає
//     let leaderCategory = await categoriesService.findByName('Провід')
//     if (!leaderCategory) {
//       leaderCategory = await categoriesService.create({
//         name: 'Провід',
//         description: 'Категорія для провідників'
//       })
//       logger.log('✅ Категорія "Провід" створена')
//     } else {
//       logger.log('⚠️ Категорія "Провід" вже існує, пропускаємо...')
//     }

//     // Створюємо групу "Адміністратори", якщо її ще немає
//     let adminGroup = await groupsService.findByName('Адміністратори')
//     if (!adminGroup) {
//       adminGroup = await groupsService.create({
//         name: 'Адміністратори',
//         numberOfParticipants: 5,
//         categoryId: leaderCategory.id // Прив'язуємо категорію до групи
//       })
//       logger.log('✅ Група "Адміністратори" створена')
//     } else {
//       logger.log('⚠️ Група "Адміністратори" вже існує, пропускаємо...')
//     }

//     // Перевіряємо чи існує System Admin
//     const existingAdmin = await usersService.findByEmail(process.env.SYSTEM_ADMIN_EMAIL || 'ms.padalka@gmail.com')
//     if (!existingAdmin) {
//       await usersService.createSystemAdmin({
//         firstName: process.env.SYSTEM_ADMIN_NAME || 'System',
//         lastName: process.env.SYSTEM_ADMIN_SURNAME || 'Admin',
//         email: process.env.SYSTEM_ADMIN_EMAIL || 'ms.padalka@gmail.com',
//         groupId: adminGroup.id // Додаємо ID групи до адміна
//       })

//       logger.log('✅ System Admin створено')
//     } else {
//       logger.log('⚠️ System Admin вже існує, пропускаємо...')
//     }
//   } catch (error) {
//     logger.error('❌ Помилка при виконанні seed-скрипта', error)
//   } finally {
//     await app.close()
//   }
// }

// seed()

import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { Seeder } from 'src/seeder/seeder'

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const seedService = app.get(Seeder) // Отримуємо SeedService

  await seedService.createSeedData() // Викликаємо метод для створення даних
  await app.close() // Закриваємо додаток
}

seed()
