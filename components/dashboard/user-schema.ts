import { z } from "zod";

export const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  is_admin: z.boolean().default(false),
});

export type UserFormValues = z.infer<typeof userFormSchema>; 