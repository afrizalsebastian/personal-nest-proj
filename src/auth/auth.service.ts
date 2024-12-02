import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from 'src/model/auth.model';
import { LoginUserDTO } from 'src/model/user.model';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(request: LoginUserDTO): Promise<AuthResponse> {
    const user = await this.userService.getByUsername(request);
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }
}
