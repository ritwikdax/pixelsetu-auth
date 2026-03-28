import { z } from "zod";

export const inviteUserToOrgSchema = z.object({
  email: z.string().email({message: "Invalid email address"}),
  role: z.enum(["admin", "editor", "viewer"], {message: "Must be a valid role"})
}).strict();

export const sessionLogoutSchema = z.object({
  encryptedSessionKey: z.string().optional()
}).strict();

export const switchActiveOrgSchema = z.object({
  orgId: z.string({ message: "Organization ID is required" })
}).strict();

export const removeOrgMemberSchema = z.object({
  email: z.string().email({ message: "Invalid email address" })
}).strict();