import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PathAuthError } from './auth.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly jwtService: JwtService,
  ) {}

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new HttpException('Login please', 401);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_KYE,
      });

      request['user'] = payload;
    } catch (err) {
      this.logger.warn(`AuthGuard.canActivate ${token}`);
      throw new HttpException(err, 401);
    }

    return true;
  }
}

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly jwtService: JwtService,
  ) {}

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new HttpException('Login please', 401);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_KYE,
      });

      if (payload.role === Role.USER) {
        request['user'] = payload;
        return true;
      }
      throw new PathAuthError('Path only for User');
    } catch (err) {
      this.logger.warn(`AuthGuard.canActivate ${token}`);

      if (err instanceof PathAuthError) {
        throw new HttpException(err.message, 403);
      }

      throw new HttpException(err, 401);
    }
  }
}

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly jwtService: JwtService,
  ) {}

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new HttpException('Login please', 401);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_KYE,
      });

      if (payload.role === Role.ADMIN) {
        request['user'] = payload;
        return true;
      }
      throw new PathAuthError('Path only for Admin');
    } catch (err) {
      this.logger.warn(`AuthGuard.canActivate ${token}`);

      if (err instanceof PathAuthError) {
        throw new HttpException(err.message, 403);
      }

      throw new HttpException(err, 401);
    }
  }
}
