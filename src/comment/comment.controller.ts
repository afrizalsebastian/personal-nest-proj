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
import { Auth } from 'src/auth/auth.decorator';
import { AuthUserGuard } from 'src/auth/auth.guard';
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
  @UseGuards(AuthUserGuard)
  async create(
    @Auth() user: User,
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
  @UseGuards(AuthUserGuard)
  async get(
    @Param('postId', ParseIntPipe) postId: number,
    @Query(QueryCommentPipe) query: CommentQueryExtract,
  ): Promise<WebResponse<ResponseCommentWithPagingDTO>> {
    console.log(JSON.stringify(query));
    const result = await this.commentService.get(postId, query);
    return {
      data: result,
      status: true,
    };
  }

  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthUserGuard)
  async getById(
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
  @UseGuards(AuthUserGuard)
  async update(
    @Auth() user: User,
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

  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthUserGuard)
  async delete(
    @Auth() user: User,
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
