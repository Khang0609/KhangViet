import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const SuccessMessageResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

