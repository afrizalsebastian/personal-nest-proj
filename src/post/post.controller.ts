import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreatePostDTO,
  PostResponseDTO,
  PostResponseWithPagingDTO,
} from 'src/model/post.model';
import { WebResponse } from 'src/model/webresponse.model';
import { QueryPostPipe } from 'src/post/post.pipe';
import { PostService } from './post.service';

@Controller('/api/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(
    @Auth() user: User,
    @Body() request: CreatePostDTO,
  ): Promise<WebResponse<PostResponseDTO>> {
    const result = await this.postService.create(user, request);

    return {
      data: result,
      status: true,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async get(
    @Auth() user: User,
    @Query(QueryPostPipe) query: any,
  ): Promise<WebResponse<PostResponseWithPagingDTO>> {
    const result = await this.postService.get(user, query);

    return {
      data: result,
      status: true,
    };
  }
}
