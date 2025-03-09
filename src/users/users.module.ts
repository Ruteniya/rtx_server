import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UserEntity } from './entities/user.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { GroupEntity } from 'src/groups/entities/group.entity'

@Module({
  imports: [SequelizeModule.forFeature([UserEntity, GroupEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
