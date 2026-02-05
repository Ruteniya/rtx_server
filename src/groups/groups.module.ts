import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { GroupEntity } from './entities/group.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { S3Module } from 'src/s3/s3.module'
import { GamesModule } from 'src/games/games.module'
import { EmailModule } from 'src/email/email.module'
import { GroupEmailResultEntity } from './entities/group-email-result.entity'

@Module({
  imports: [SequelizeModule.forFeature([GroupEntity, CategoryEntity, UserEntity, GroupEmailResultEntity]), S3Module, EmailModule, GamesModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService]
})
export class GroupsModule {}
