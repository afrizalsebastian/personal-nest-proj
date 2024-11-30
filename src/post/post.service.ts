import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Post, User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreatePostDTO,
  DetailPostResponseDTO,
  PostQueryExtract,
  PostResponseDTO,
  PostResponseWithPagingDTO,
} from 'src/model/post.model';
import { Logger } from 'winston';
import { PostValidation } from './post.validation';

@Injectable()
export class PostService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  private toPostResponseDto(
    post: Post,
    username: string = undefined,
    publishedDate: string = undefined,
  ): PostResponseDTO {
    return {
      content: post.content,
      id: post.id,
      title: post.title,
      username,
      publishedDate,
    };
  }

  private toDetailPostResponseDto(
    post: Post,
    username: string,
  ): DetailPostResponseDTO {
    return {
      content: post.content,
      id: post.id,
      title: post.title,
      isPublished: post.isPublished,
      publishedAt: post.publishedAt?.toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
      }),
      username,
    };
  }

  async create(user: User, request: CreatePostDTO): Promise<PostResponseDTO> {
    this.logger.debug(`PostService.create ${user.username}`);

    const { content, title, isPublished } = this.validationService.validate(
      PostValidation.CREATE,
      request,
    );

    const result = await this.prismaService.post.create({
      data: {
        content,
        title,
        isPublished,
        publishedAt: isPublished ? new Date() : undefined,
        userId: user.id,
      },
    });

    return this.toPostResponseDto(result);
  }

  async get(
    user: User,
    query: PostQueryExtract,
  ): Promise<PostResponseWithPagingDTO> {
    this.logger.debug(`PostService.create ${user.username}`);

    const skip = (query.page - 1) * query.rows;
    const result = await this.prismaService.post.findMany({
      where: query.where,
      skip,
      take: query.rows,
      orderBy: query.orderBy,
      include: {
        user: true,
      },
    });

    const totalRecord = await this.prismaService.post.count({
      where: query.where,
      orderBy: query.orderBy,
    });
    const totalPage = Math.ceil(totalRecord / query.rows);

    return {
      page: query.page,
      totalPage,
      posts: result.map((it) =>
        this.toPostResponseDto(
          it,
          it.user.username,
          it.publishedAt?.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
        ),
      ),
    };
  }

  async getPostCurrentUser(
    user: User,
    query: PostQueryExtract,
  ): Promise<PostResponseWithPagingDTO> {
    this.logger.debug(`PostService.create ${user.username}`);

    const skip = (query.page - 1) * query.rows;
    query.where['userId'] = user.id;

    const result = await this.prismaService.post.findMany({
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
      posts: result.map((it) =>
        this.toPostResponseDto(
          it,
          user.username,
          it.publishedAt?.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
        ),
      ),
    };
  }

  async getById(user: User, postId: number): Promise<DetailPostResponseDTO> {
    this.logger.debug(`PostService.create ${user.username}`);

    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: true,
      },
    });

    if (!post) {
      throw new HttpException('Post Not Found', 404);
    }

    return this.toDetailPostResponseDto(post, post.user.username);
  }
}
