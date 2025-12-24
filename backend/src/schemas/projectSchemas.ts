import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string(),
  width: z.number().optional(),
});
