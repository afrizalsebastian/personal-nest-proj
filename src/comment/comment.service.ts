import { HttpException, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CommentQueryExtract,
  CreateCommentDTO,
  ResponseCommentDTO,
  ResponseCommentWithPagingDTO,
  UpdateCommentDTO,
} from 'src/dtos/comment.dto';
import { PostService } from 'src/post/post.service';
import { Logger } from 'winston';
import { CommentValidation } from './comment.validation';

@Injectable()
export class CommentService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly postService: PostService,
    private readonly validationService: ValidationService,
  ) {}

  private toResponseComment(
    content: string,
    postId: number,
    commentId: number,
  ): ResponseCommentDTO {
    return { content, postId, commentId };
  }

  async create(
    user: User,
    postId: number,
    request: CreateCommentDTO,
  ): Promise<ResponseCommentDTO> {
    this.logger.debug(`CommentService.create ${user.username}`);

    await this.postService.getById(postId);
    const createRequest = this.validationService.validate(
      CommentValidation.CREATE,
      request,
    );

    const comment = await this.prismaService.comment.create({
      data: {
        postId,
        userId: user.id,
        content: createRequest.content,
      },
    });

    return this.toResponseComment(comment.content, postId, comment.id);
  }

  async get(
    postId: number,
    query: CommentQueryExtract,
  ): Promise<ResponseCommentWithPagingDTO> {
    await this.postService.getById(postId);

    query.where['postId'] = postId;
    const skip = (query.page - 1) * query.rows;
    const result = await this.prismaService.comment.findMany({
      where: query.where,
      skip,
      take: query.rows,
      orderBy: query.orderBy,
    });

    const totalRecord = await this.prismaService.post.count({
      where: query.where,
      orderBy: query.orderBy,
    });
    const totalPage = Math.ceil(totalRecord / query.rows);

    return {
      page: query.page,
      totalPage,
      comments: result.map((it) =>
        this.toResponseComment(it.content, postId, it.id),
      ),
    };
  }

  async getById(
    postId: number,
    commentId: number,
  ): Promise<ResponseCommentDTO> {
    await this.postService.getById(postId);

    const result = await this.prismaService.comment.findUnique({
      where: {
        postId,
        id: commentId,
      },
    });

    if (!result) {
      throw new HttpException('Comment Not Found', 404);
    }

    return this.toResponseComment(result.content, postId, result.id);
  }

  async update(
    user: User,
    postId: number,
    commentId: number,
    request: UpdateCommentDTO,
  ): Promise<ResponseCommentDTO> {
    await this.postService.getById(postId);

    const isCommentExists =
      (await this.prismaService.comment.count({
        where: {
          postId,
          id: commentId,
          userId: user.id,
        },
      })) > 0;

    if (!isCommentExists) {
      throw new HttpException('Comment Not Found', 404);
    }

    const { content } = this.validationService.validate(
      CommentValidation.UPDATE,
      request,
    );

    const result = await this.prismaService.comment.update({
      where: {
        postId,
        id: commentId,
        userId: user.id,
      },
      data: {
        content,
      },
    });

    return this.toResponseComment(result.content, postId, result.id);
  }

  async delete(
    user: User,
    postId: number,
    commentId: number,
  ): Promise<ResponseCommentDTO> {
    await this.postService.getById(postId);

    const isCommentExists =
      (await this.prismaService.comment.count({
        where: {
          postId,
          id: commentId,
          userId: user.id,
        },
      })) > 0;

    if (!isCommentExists) {
      throw new HttpException('Comment Not Found', 404);
    }

    const result = await this.prismaService.comment.delete({
      where: {
        postId,
        id: commentId,
        userId: user.id,
      },
    });

    return this.toResponseComment(result.content, postId, result.id);
  }
}
