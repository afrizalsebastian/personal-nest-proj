import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Profile, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateUserDTO,
  LoginUserDTO,
  ResponseUserDTO,
  UpdateUserDTO,
} from 'src/dtos/user.dto';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  private toResponseUser(user: User, profile: Profile = null): ResponseUserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: profile?.fullName,
      bio: profile?.bio,
    };
  }

  async create(request: CreateUserDTO): Promise<ResponseUserDTO> {
    this.logger.debug(`UserService.create ${request.email}`);

    const createRequest = this.validationService.validate(
      UserValidation.CREATE,
      request,
    );

    const existingUserWithUsername = await this.prismaService.user.count({
      where: {
        username: createRequest.username,
      },
    });

    if (existingUserWithUsername != 0) {
      throw new HttpException('Username already used', 400);
    }

    const existingUserWithEmail = await this.prismaService.user.count({
      where: {
        email: createRequest.email,
      },
    });

    if (existingUserWithEmail != 0) {
      throw new HttpException('Email already used', 400);
    }

    createRequest.password = await bcrypt.hash(createRequest.password, 10);

    const { user, profile } = await this.prismaService.$transaction(
      async (tx) => {
        try {
          const user = await tx.user.create({
            data: {
              email: createRequest.email,
              username: createRequest.username,
              password: createRequest.password,
            },
          });

          const profile = await tx.profile.create({
            data: {
              fullName: createRequest.fullName,
              bio: createRequest.bio,
              userId: user.id,
            },
          });
          return { user, profile };
        } catch (err) {
          this.logger.error(`UserService.create ${err}`);
          throw new HttpException('Failed to create user', 500);
        }
      },
    );

    return this.toResponseUser(user, profile);
  }

  async getByUsername(request: LoginUserDTO): Promise<ResponseUserDTO> {
    this.logger.debug(`UserService.getByUsername ${request.email}`);

    const loginRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginRequest.email,
      },
      include: {
        profile: true,
      },
    });
    if (!user) {
      throw new HttpException('email or password invalid', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('email or password invalid', 401);
    }

    return this.toResponseUser(user, user.profile);
  }

  async update(user: User, request: UpdateUserDTO): Promise<ResponseUserDTO> {
    this.logger.debug(`UserService.update ${user.username}`);

    const updateRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );

    if (updateRequest.username) {
      const existingUserWithUsername = await this.prismaService.user.count({
        where: {
          username: updateRequest.username,
        },
      });

      if (existingUserWithUsername != 0) {
        throw new HttpException('Username already used', 400);
      }
    }

    if (updateRequest.email) {
      const existingUserWithEmail = await this.prismaService.user.count({
        where: {
          email: updateRequest.email,
        },
      });

      if (existingUserWithEmail != 0) {
        throw new HttpException('Email already used', 400);
      }
    }

    const updated = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: updateRequest,
    });

    return this.toResponseUser(updated);
  }

  async delete(user: User): Promise<ResponseUserDTO> {
    this.logger.debug(`UserService.delete ${user.username}`);

    const result = await this.prismaService.user.delete({
      where: {
        id: user.id,
      },
      include: {
        profile: true,
      },
    });

    return this.toResponseUser(result, result.profile);
  }
}
