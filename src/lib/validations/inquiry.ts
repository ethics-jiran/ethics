import { z } from 'zod';

export const createInquirySchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content required').max(5000, 'Content too long').optional(),
  email: z.string().email('Invalid email').optional(),
  name: z.string().min(1, 'Name required').optional(),
  phone: z.string().optional(),
  // Encrypted fields
  encrypted_title: z.string().optional(),
  encrypted_content: z.string().optional(),
  encrypted_email: z.string().optional(),
  encrypted_name: z.string().optional(),
  encrypted_phone: z.string().optional(),
});

export const verifyInquirySchema = z.object({
  email: z.string().email().optional(),
  authCode: z.string().length(6, 'Code must be 6 characters').toUpperCase(),
  // Encrypted fields
  encrypted_email: z.string().optional(),
});

export const sendReplySchema = z.object({
  replyTitle: z.string().min(1, 'Reply title required'),
  replyContent: z.string().min(1, 'Reply content required'),
  status: z.enum(['pending', 'processing', 'completed']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed']),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type VerifyInquiryInput = z.infer<typeof verifyInquirySchema>;
export type SendReplyInput = z.infer<typeof sendReplySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
