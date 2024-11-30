import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateUserDTO,
  ResponseUserDTO,
  UpdateUserDTO,
} from 'src/model/user.model';
import { WebResponse } from 'src/model/webresponse.model';
import { UserService } from './user.service';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() request: CreateUserDTO,
  ): Promise<WebResponse<ResponseUserDTO>> {
    const result = await this.userService.create(request);
    return {
      data: result,
      status: true,
    };
  }

  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async get(@Auth() user: User): Promise<WebResponse<Record<string, string>>> {
    return {
      data: {
        email: user.email,
        username: user.username,
      },
      status: true,
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async update(
    @Auth() user: User,
    @Body() request: UpdateUserDTO,
  ): Promise<WebResponse<ResponseUserDTO>> {
    const result = await this.userService.update(user, request);
    return {
      data: result,
      status: true,
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async delete(@Auth() user: User): Promise<WebResponse<ResponseUserDTO>> {
    const result = await this.userService.delete(user);
    return {
      data: result,
      status: true,
    };
  }
}
