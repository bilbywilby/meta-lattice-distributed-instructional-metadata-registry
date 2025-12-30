import { z } from "zod";
export const EntitySchema = z.object({
  id: z.string().min(1, "Identifier is required"),
  type: z.enum(['resource', 'module', 'assessment', 'competency']),
  name: z.string().min(1, "Name is required"),
  content: z.record(z.any()).default({}),
  dependencies: z.array(z.string()).default([]),
});
export type EntityFormValues = z.infer<typeof EntitySchema>;