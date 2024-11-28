import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDTO, ResponseUserDTO } from 'src/model/user.model';
import { WebResponse } from 'src/model/webresponse.model';
import { UserService } from './user.service';

@Controller('/api/users')
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
  async testConnection(@Auth() user: User): Promise<Record<string, string>> {
    console.log(user);
    return {
      messange: 'connection',
    };
  }
}
