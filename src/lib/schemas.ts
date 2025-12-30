import { z } from "zod";
export const EntitySchema = z.object({
  id: z.string().min(1, "Identifier is required"),
  type: z.enum(['resource', 'module', 'assessment', 'competency']),
  name: z.string().min(1, "Name is required"),
  content: z.record(z.string(), z.any()).default({}),
  dependencies: z.array(z.string()).default([]),
});
export type EntityFormValues = z.infer<typeof EntitySchema>;
export const MetadataSchemaDefinition = z.object({
  id: z.string().min(1, "Schema ID is required"),
  name: z.string().min(1, "Schema Name is required"),
  structure: z.record(z.string(), z.any()).default({}),
});
export type SchemaFormValues = z.infer<typeof MetadataSchemaDefinition>;