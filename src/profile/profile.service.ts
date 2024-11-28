import { Inject, Injectable } from '@nestjs/common';
import { Profile, User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { ProfileResponse, UpdateProfileDTO } from 'src/model/profile.model';
import { Logger } from 'winston';
import { ProfileValidation } from './profile.validation';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  private toProfileResponse(profile: Profile): ProfileResponse {
    return {
      fullName: profile.fullName,
      bio: profile.bio,
      userId: profile.userId,
    };
  }

  async get(user: User) {
    this.logger.debug(`ProfileService.get ${user.username}`);

    const profile = await this.prismaService.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    return this.toProfileResponse(profile);
  }

  async update(user: User, request: UpdateProfileDTO) {
    this.logger.debug(`ProfileService.update ${user.username}`);
    const updateRequest = this.validationService.validate(
      ProfileValidation.UPDATE,
      request,
    );

    const profile = await this.prismaService.profile.update({
      where: {
        userId: user.id,
      },
      data: updateRequest,
    });

    return this.toProfileResponse(profile);
  }
}
