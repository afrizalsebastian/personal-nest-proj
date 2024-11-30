import { z, ZodType } from 'zod';

export class PostValidation {
  static readonly CREATE: ZodType = z.object({
    title: z.string().min(1).max(250),
    content: z.string().min(1),
    isPublished: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    title: z.string().min(1).max(250).optional(),
    content: z.string().min(1).optional(),
    isPublished: z.boolean().optional(),
  });
}
