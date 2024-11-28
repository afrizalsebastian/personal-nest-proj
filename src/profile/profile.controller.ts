import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('/api/profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // @Put('')
  // @HttpCode(200)
  // async update(@Body() request: UpdateProfileDTO): Promise<WebResponse<ProfileResponse>>{
  //   request.userId = 1; // Nanti Diangti dari hasil jwt

  //   const result = await this.profileService.update(, request)

  //   return {
  //     data: result,
  //     status: true
  //   }
  // }
}
