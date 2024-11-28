import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ProfileModule } from './profile/profile.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [CommonModule, UserModule, ProfileModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
