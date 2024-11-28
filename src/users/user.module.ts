import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserServive } from './user.service';

@Module({
  providers: [UserServive],
  controllers: [UserController],
})
export class UserModule {}
