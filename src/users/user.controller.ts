import { Controller, Get, HttpCode } from '@nestjs/common';
import { UserServive } from './user.service';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserServive) {}

  @Get()
  @HttpCode(200)
  async testConnection(): Promise<Record<string, string>> {
    return {
      messange: 'connection',
    };
  }
}
