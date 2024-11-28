import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
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
  async testConnection(): Promise<Record<string, string>> {
    return {
      messange: 'connection',
    };
  }
}
