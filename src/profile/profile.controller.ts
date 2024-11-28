import {
  Body,
  Controller,
  Get,
  HttpCode,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProfileResponse, UpdateProfileDTO } from 'src/model/profile.model';
import { WebResponse } from 'src/model/webresponse.model';
import { ProfileService } from './profile.service';

@Controller('/api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async get(@Auth() user: User): Promise<WebResponse<ProfileResponse>> {
    const result = await this.profileService.get(user);
    return {
      data: result,
      status: true,
    };
  }

  @Put()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async update(
    @Auth() user: User,
    @Body() request: UpdateProfileDTO,
  ): Promise<WebResponse<ProfileResponse>> {
    request.userId = user.id;
    const result = await this.profileService.update(user, request);
    return {
      data: result,
      status: true,
    };
  }
}
