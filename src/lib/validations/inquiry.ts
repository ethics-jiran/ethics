import { z } from 'zod';

// Admin API schemas
export const sendReplySchema = z.object({
  replyTitle: z.string().min(1, 'Reply title required'),
  replyContent: z.string().min(1, 'Reply content required'),
  status: z.enum(['pending', 'processing', 'completed']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed']),
});

export type SendReplyInput = z.infer<typeof sendReplySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
