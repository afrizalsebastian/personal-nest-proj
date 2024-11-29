import { z, ZodType } from 'zod';

export class ProfileValidation {
  static readonly UPDATE: ZodType = z.object({
    fullName: z.string().min(1).optional(),
    bio: z.string().min(1).optional(),
  });
}
