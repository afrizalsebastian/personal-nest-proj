import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly CREATE: ZodType = z.object({
    username: z.string().min(1).max(100),
    email: z.string().min(1).max(100),
    password: z.string().min(1).max(255),
    fullName: z.string().min(1).max(250),
    bio: z.string().min(1).optional(),
  });
}
