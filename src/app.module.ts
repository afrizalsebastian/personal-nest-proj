import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ProfileModule } from './profile/profile.module';
import { UserModule } from './users/user.module';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [CommonModule, AuthModule, UserModule, ProfileModule, PostModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
