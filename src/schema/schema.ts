import { z } from "zod";

export const inviteUserToOrgSchema = z.object({
  email: z.string().email({message: "Invalid email address"}),
  role: z.enum(["admin", "editor", "viewer"], {message: "Must be a valid role"})
}).strict();