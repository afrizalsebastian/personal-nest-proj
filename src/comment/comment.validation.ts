import { z, ZodType } from 'zod';

export class CommentValidation {
  static readonly CREATE: ZodType = z.object({
    content: z.string().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    content: z.string().min(1),
  });
}
