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
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Auth } from 'src/auth/auth.decorator';
import { AuthUserGuard } from 'src/auth/auth.guard';
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
  @UseGuards(AuthUserGuard)
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
  @UseGuards(AuthUserGuard)
  async get(
    @Req() req: Request,
    @Query(QueryPostPipe) query: any,
  ): Promise<WebResponse<PostResponseWithPagingDTO>> {
    const cacheKey = req.url;
    const result = await this.postService.get(query, cacheKey, true);

    return {
      data: result,
      status: true,
    };
  }

  @Get('/my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthUserGuard)
  async getPostCurrentUser(
    @Req() req: Request,
    @Auth() user: User,
    @Query(QueryPostPipe) query: any,
  ): Promise<WebResponse<PostResponseWithPagingDTO>> {
    const cacheKey = `${req.url}--${user.id}`;
    const result = await this.postService.getPostCurrentUser(
      user,
      query,
      cacheKey,
      true,
    );

    return {
      data: result,
      status: true,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthUserGuard)
  async getById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<WebResponse<DetailPostResponseDTO>> {
    const cahceKey = req.url;
    const result = await this.postService.getById(postId, cahceKey, true);

    return {
      data: result,
      status: true,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthUserGuard)
  async update(
    @Auth() user: User,
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
  @UseGuards(AuthUserGuard)
  async delete(
    @Auth() user: User,
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<WebResponse<DetailPostResponseDTO>> {
    const result = await this.postService.delete(user, postId);

    return {
      data: result,
      status: true,
    };
  }
}
