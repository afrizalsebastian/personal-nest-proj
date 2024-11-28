import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthResponse } from 'src/model/auth.model';
import { LoginUserDTO } from 'src/model/user.model';
import { WebResponse } from 'src/model/webresponse.model';
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
