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
  UseGuards,
} from '@nestjs/common';
import { AuthAdminGuard, AuthGuard } from 'src/auth/auth.guard';
import {
  CreateCategoryDTO,
  ResponseCategoryDTO,
  UpdateCategoryDTO,
} from 'src/dtos/category.dto';
import { WebResponse } from 'src/dtos/webresponse.dto';
import { CategoryService } from './category.service';

@Controller('/api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthAdminGuard)
  async create(
    @Body() request: CreateCategoryDTO,
  ): Promise<WebResponse<ResponseCategoryDTO>> {
    const result = await this.categoryService.create(request);
    return {
      data: result,
      status: true,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async get(): Promise<WebResponse<ResponseCategoryDTO[]>> {
    const result = await this.categoryService.get();
    return {
      data: result,
      status: true,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAdminGuard)
  async update(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() request: UpdateCategoryDTO,
  ): Promise<WebResponse<ResponseCategoryDTO>> {
    const result = await this.categoryService.update(categoryId, request);
    return {
      data: result,
      status: true,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAdminGuard)
  async delete(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<WebResponse<ResponseCategoryDTO>> {
    const result = await this.categoryService.delete(categoryId);
    return {
      data: result,
      status: true,
    };
  }
}
