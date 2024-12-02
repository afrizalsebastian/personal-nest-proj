import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthResponse } from 'src/dtos/auth.dto';
import { LoginUserDTO } from 'src/dtos/user.dto';
import { WebResponse } from 'src/dtos/webresponse.dto';
import { AuthService } from './auth.service';

@Controller('/api/login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginUserDTO,
  ): Promise<WebResponse<AuthResponse>> {
    return {
      data: await this.authService.login(request),
      status: true,
    };
  }
}
