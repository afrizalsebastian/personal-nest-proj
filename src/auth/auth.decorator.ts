import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user.role === Role.USER) {
      return request.user;
    }
    throw new HttpException('Path only for user', 403);
  },
);

export const AuthAdmin = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user.role === Role.ADMIN) {
      return request.user;
    }
    throw new HttpException('Path only for admin', 403);
  },
);
