import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreatePostDTO,
  DetailPostResponseDTO,
  PostResponseDTO,
  PostResponseWithPagingDTO,
  UpdatePostDTO,
} from 'src/dtos/post.dto';
import { WebResponse } from 'src/dtos/webresponse.dto';
import { QueryPostPipe } from 'src/post/post.pipe';
import { PostService } from './post.service';

@Controller('/api/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(
    @AuthUser() user: User,
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
    @AuthUser() user: User,
    @Query(QueryPostPipe) query: any,
  ): Promise<WebResponse<PostResponseWithPagingDTO>> {
    const result = await this.postService.get(user, query);

    return {
      data: result,
      status: true,
    };
  }

  @Get('/my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getPostCurrentUser(
    @AuthUser() user: User,
    @Query(QueryPostPipe) query: any,
  ): Promise<WebResponse<PostResponseWithPagingDTO>> {
    const result = await this.postService.getPostCurrentUser(user, query);

    return {
      data: result,
      status: true,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getById(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<WebResponse<DetailPostResponseDTO>> {
    const result = await this.postService.getById(user, postId);

    return {
      data: result,
      status: true,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async update(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) postId: number,
    @Body() request: UpdatePostDTO,
  ): Promise<WebResponse<DetailPostResponseDTO>> {
    const result = await this.postService.update(user, postId, request);

    return {
      data: result,
      status: true,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async delete(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<WebResponse<DetailPostResponseDTO>> {
    const result = await this.postService.delete(user, postId);

    return {
      data: result,
      status: true,
    };
  }
}
