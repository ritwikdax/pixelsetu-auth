import { z } from "zod";

export const inviteUserToOrgSchema = z.object({
  email: z.string().email()
});