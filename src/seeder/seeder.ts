import { Injectable, Logger } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { GroupsService } from '../groups/groups.service'
import { CategoriesService } from '../categories/categories.service'

@Injectable()
export class Seeder {
  private readonly logger = new Logger(Seeder.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
    private readonly categoriesService: CategoriesService
  ) {}

  async createSeedData() {
    try {
      let leaderCategory = await this.categoriesService.findByName('Провід')
      if (!leaderCategory) {
        leaderCategory = await this.categoriesService.create({
          name: 'Провід',
          description: 'Категорія для провідників'
        })
        this.logger.log('✅ Категорія "Провід" створена')
      } else {
        this.logger.log('⚠️ Категорія "Провід" вже існує, пропускаємо...')
      }

      let adminGroup = await this.groupsService.findByName('Адміністратори')
      if (!adminGroup) {
        adminGroup = await this.groupsService.create({
          name: 'Адміністратори',
          numberOfParticipants: 5,
          categoryId: leaderCategory.id
        })
        this.logger.log('✅ Група "Адміністратори" створена')
      } else {
        this.logger.log('⚠️ Група "Адміністратори" вже існує, пропускаємо...')
      }

      const existingAdmin = await this.usersService.findByEmail(
        process.env.SYSTEM_ADMIN_EMAIL || 'ms.padalka@gmail.com'
      )
      if (!existingAdmin) {
        await this.usersService.createSystemAdmin({
          firstName: process.env.SYSTEM_ADMIN_NAME || 'System',
          lastName: process.env.SYSTEM_ADMIN_SURNAME || 'Admin',
          email: process.env.SYSTEM_ADMIN_EMAIL || 'ms.padalka@gmail.com',
          groupId: adminGroup.id
        })
        this.logger.log('✅ System Admin створено')
      } else {
        this.logger.log('⚠️ System Admin вже існує, пропускаємо...')
      }
    } catch (error) {
      this.logger.error('❌ Помилка при створенні даних', error)
    }
  }
}
