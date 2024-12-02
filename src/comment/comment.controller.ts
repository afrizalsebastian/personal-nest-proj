import {
  Body,
  Controller,
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
  CommentQueryExtract,
  CreateCommentDTO,
  ResponseCommentDTO,
  ResponseCommentWithPagingDTO,
  UpdateCommentDTO,
} from 'src/dtos/comment.dto';
import { WebResponse } from 'src/dtos/webresponse.dto';
import { QueryCommentPipe } from './comment.pipe';
import { CommentService } from './comment.service';

@Controller('/api/post/:postId/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(
    @AuthUser() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() request: CreateCommentDTO,
  ): Promise<WebResponse<ResponseCommentDTO>> {
    const result = await this.commentService.create(user, postId, request);
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
    @Param('postId', ParseIntPipe) postId: number,
    @Query(QueryCommentPipe) query: CommentQueryExtract,
  ): Promise<WebResponse<ResponseCommentWithPagingDTO>> {
    const result = await this.commentService.get(postId, query);
    return {
      data: result,
      status: true,
    };
  }

  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getById(
    @AuthUser() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<WebResponse<ResponseCommentDTO>> {
    const result = await this.commentService.getById(postId, commentId);
    return {
      data: result,
      status: true,
    };
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async update(
    @AuthUser() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() request: UpdateCommentDTO,
  ): Promise<WebResponse<ResponseCommentDTO>> {
    const result = await this.commentService.update(
      user,
      postId,
      commentId,
      request,
    );
    return {
      data: result,
      status: true,
    };
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async delete(
    @AuthUser() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<WebResponse<ResponseCommentDTO>> {
    const result = await this.commentService.delete(user, postId, commentId);
    return {
      data: result,
      status: true,
    };
  }
}
