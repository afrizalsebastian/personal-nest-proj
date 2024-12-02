import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateCategoryDTO,
  ResponseCategoryDTO,
  UpdateCategoryDTO,
} from 'src/dtos/category.dto';
import { Logger } from 'winston';
import { CategoryValidation } from './category.validation';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly validationSercice: ValidationService,
  ) {}

  private toCategoryResponse(category: Category): ResponseCategoryDTO {
    return {
      name: category.name,
      id: category.id,
      description: category.description,
    };
  }

  async create(request: CreateCategoryDTO): Promise<ResponseCategoryDTO> {
    const createRequest = this.validationSercice.validate(
      CategoryValidation.CREATE,
      request,
    );

    const isCategoryExists =
      (await this.prismaService.category.count({
        where: {
          name: createRequest.name.toLowerCase(),
        },
      })) > 0;

    if (isCategoryExists) {
      throw new HttpException('Category has been exists', 400);
    }

    const category = await this.prismaService.category.create({
      data: {
        name: createRequest.name.toLowerCase(),
        description: createRequest.description,
      },
    });

    return this.toCategoryResponse(category);
  }

  async get(): Promise<ResponseCategoryDTO[]> {
    const categories = await this.prismaService.category.findMany();
    return categories.map((it) => this.toCategoryResponse(it));
  }

  async update(
    categoryId: number,
    request: UpdateCategoryDTO,
  ): Promise<ResponseCategoryDTO> {
    const updateRequest = this.validationSercice.validate(
      CategoryValidation.UPDATE,
      request,
    );

    const isCategoryExists =
      (await this.prismaService.category.count({
        where: {
          id: categoryId,
        },
      })) > 0;

    if (!isCategoryExists) {
      throw new HttpException('Category not found', 404);
    }

    const updatedCategory = await this.prismaService.category.update({
      where: {
        id: categoryId,
      },
      data: updateRequest,
    });

    return this.toCategoryResponse(updatedCategory);
  }

  async delete(categoryId: number): Promise<ResponseCategoryDTO> {
    const isCategoryExists =
      (await this.prismaService.category.count({
        where: {
          id: categoryId,
        },
      })) > 0;

    if (!isCategoryExists) {
      throw new HttpException('Category not found', 404);
    }

    const updatedCategory = await this.prismaService.category.delete({
      where: {
        id: categoryId,
      },
    });

    return this.toCategoryResponse(updatedCategory);
  }
}
