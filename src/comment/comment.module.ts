import { Module } from '@nestjs/common';
import { PostModule } from 'src/post/post.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [PostModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
