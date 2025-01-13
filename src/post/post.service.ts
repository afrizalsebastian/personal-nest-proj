import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Category, Post, User } from '@prisma/client';
import { Cache } from 'cache-manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { TTL } from 'src/constants/cache';
import {
  CreatePostDTO,
  DetailPostResponseDTO,
  PostQueryExtract,
  PostResponseDTO,
  PostResponseWithPagingDTO,
  UpdatePostDTO,
} from 'src/dtos/post.dto';
import { Logger } from 'winston';
import { PostValidation } from './post.validation';

@Injectable()
export class PostService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  private toPostResponseDto(
    post: Post,
    categories: Category[] = [],
    username: string = undefined,
    publishedDate: string = undefined,
  ): PostResponseDTO {
    return {
      content: post.content,
      id: post.id,
      title: post.title,
      username,
      publishedDate,
      category: categories.map((it) => ({ name: it.name, id: it.id })),
    };
  }

  private toDetailPostResponseDto(
    post: Post,
    username: string,
    categories: Category[] = [],
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
      category: categories.map((it) => ({ name: it.name, id: it.id })),
    };
  }

  async create(user: User, request: CreatePostDTO): Promise<PostResponseDTO> {
    this.logger.debug(`PostService.create ${user.username}`);

    const { content, title, isPublished, category } =
      this.validationService.validate(PostValidation.CREATE, request);

    try {
      const categories = category.map((it) => ({ categoryId: it }));
      const result = await this.prismaService.post.create({
        data: {
          content,
          title,
          isPublished,
          publishedAt: isPublished ? new Date() : undefined,
          userId: user.id,
          categories: {
            create: categories,
          },
        },
        include: {
          categories: {
            include: {
              Category: true,
            },
          },
        },
      });

      return this.toPostResponseDto(
        result,
        result.categories.map((it) => it.Category),
      );
    } catch (err) {
      if (err.code === 'P2003') {
        throw new HttpException(
          'Categories not found. please check post categories',
          400,
        );
      }

      throw new HttpException('Internal Server Error', 500);
    }
  }

  async get(
    query: PostQueryExtract,
    cacheKey: string = '',
    isCache: boolean = false,
  ): Promise<PostResponseWithPagingDTO> {
    const valueCache = await this.cacheManager.get(cacheKey);
    if (isCache && valueCache) {
      return JSON.parse(valueCache.toString());
    }

    const skip = (query.page - 1) * query.rows;
    const result = await this.prismaService.post.findMany({
      where: query.where,
      skip,
      take: query.rows,
      orderBy: query.orderBy,
      include: {
        user: true,
        categories: {
          include: {
            Category: true,
          },
        },
      },
    });

    const totalRecord = await this.prismaService.post.count({
      where: query.where,
      orderBy: query.orderBy,
    });
    const totalPage = Math.ceil(totalRecord / query.rows);

    const resultPosts = {
      page: query.page,
      totalPage,
      posts: result.map((it) =>
        this.toPostResponseDto(
          it,
          it.categories.map((it) => it.Category),
          it.user.username,
          it.publishedAt?.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
        ),
      ),
    };

    if (isCache) {
      await this.cacheManager.set(cacheKey, JSON.stringify(resultPosts), TTL);
    }

    return resultPosts;
  }

  async getPostCurrentUser(
    user: User,
    query: PostQueryExtract,
    cacheKey: string = '',
    isCache: boolean = false,
  ): Promise<PostResponseWithPagingDTO> {
    this.logger.debug(`PostService.getPostCurrentUser ${user.username}`);

    const valueCache = await this.cacheManager.get(cacheKey);
    if (isCache && valueCache) {
      return JSON.parse(valueCache.toString());
    }

    const skip = (query.page - 1) * query.rows;
    query.where['userId'] = user.id;

    const result = await this.prismaService.post.findMany({
      where: query.where,
      skip,
      take: query.rows,
      orderBy: query.orderBy,
      include: {
        categories: {
          include: {
            Category: true,
          },
        },
      },
    });

    const totalRecord = await this.prismaService.post.count({
      where: query.where,
      orderBy: query.orderBy,
    });
    const totalPage = Math.ceil(totalRecord / query.rows);

    const resultPosts = {
      page: query.page,
      totalPage,
      posts: result.map((it) =>
        this.toPostResponseDto(
          it,
          it.categories.map((it) => it.Category),
          user.username,
          it.publishedAt?.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
        ),
      ),
    };

    if (isCache) {
      await this.cacheManager.set(cacheKey, JSON.stringify(resultPosts), TTL);
    }

    return resultPosts;
  }

  async getById(
    postId: number,
    cacheKey: string = '',
    isCache: boolean = false,
  ): Promise<DetailPostResponseDTO> {
    const valueCache = await this.cacheManager.get(cacheKey);
    if (isCache && valueCache) {
      return JSON.parse(valueCache.toString());
    }

    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: true,
        categories: {
          include: {
            Category: true,
          },
        },
      },
    });

    if (!post) {
      throw new HttpException('Post Not Found', 404);
    }

    const result = this.toDetailPostResponseDto(
      post,
      post.user.username,
      post.categories.map((it) => it.Category),
    );

    if (isCache && post) {
      await this.cacheManager.set(cacheKey, JSON.stringify(result), TTL);
    }
    return result;
  }

  async update(
    user: User,
    postId: number,
    request: UpdatePostDTO,
  ): Promise<DetailPostResponseDTO> {
    this.logger.debug(`PostService.update ${user.username}`);

    const existingPost = await this.prismaService.post.findUnique({
      where: {
        userId: user.id,
        id: postId,
      },
    });
    if (!existingPost) {
      throw new HttpException('Post Not Found', 404);
    }

    const { title, content, isPublished, category } =
      this.validationService.validate(PostValidation.UPDATE, request);

    let categoriesToDelete = [];
    let categoriesToAdd = [];
    if (category) {
      const existingCategoryIds = (
        await this.prismaService.categoryOnPost.findMany({
          where: {
            postId: postId,
          },
        })
      ).map((it) => it.categoryId);

      categoriesToDelete = existingCategoryIds
        .filter((it) => !category.includes(it))
        .map((id) => ({
          postId_categoryId: {
            postId,
            categoryId: id,
          },
        }));
      categoriesToAdd = category
        .filter((it) => !existingCategoryIds.includes(it))
        .map((id) => ({
          categoryId: id,
        }));
    }

    console.log(categoriesToAdd, categoriesToDelete);
    try {
      // const updatedCategory
      const updatedRequest = await this.prismaService.post.update({
        where: {
          userId: user.id,
          id: postId,
        },
        data: {
          title,
          content,
          isPublished,
          publishedAt:
            !existingPost.isPublished && isPublished
              ? new Date()
              : existingPost.isPublished && isPublished === false
                ? null
                : existingPost.publishedAt,
          categories: {
            delete: categoriesToDelete,
            create: categoriesToAdd,
          },
        },
        include: {
          categories: {
            include: {
              Category: true,
            },
          },
        },
      });

      return this.toDetailPostResponseDto(
        updatedRequest,
        user.username,
        updatedRequest.categories.map((it) => it.Category),
      );
    } catch (err) {
      if (err.code === 'P2003') {
        throw new HttpException(
          'Categories not found. please check post categories',
          400,
        );
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }

  async delete(user: User, postId: number): Promise<DetailPostResponseDTO> {
    this.logger.debug(`PostService.delete ${user.username}`);

    const existingPost =
      (await this.prismaService.post.count({
        where: {
          userId: user.id,
          id: postId,
        },
      })) > 0;
    if (!existingPost) {
      throw new HttpException('Post Not Found', 404);
    }

    const post = await this.prismaService.post.delete({
      where: {
        id: postId,
        userId: user.id,
      },
      include: {
        categories: {
          include: {
            Category: true,
          },
        },
      },
    });

    return this.toDetailPostResponseDto(
      post,
      user.username,
      post.categories.map((it) => it.Category),
    );
  }
}
