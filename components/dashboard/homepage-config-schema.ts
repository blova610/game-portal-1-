import { z } from "zod";

export const homepageConfigFormSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

export type HomepageConfigFormValues = z.infer<typeof homepageConfigFormSchema>; 