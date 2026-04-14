import { z } from "zod";

export const inviteUserToOrgSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    role: z.enum(["admin", "editor", "viewer"], {
      message: "Must be a valid role",
    }),
  })
  .strict();

export const sessionLogoutSchema = z
  .object({
    encryptedSessionKey: z.string().optional(),
  })
  .strict();

export const switchActiveOrgSchema = z
  .object({
    orgId: z.string({ message: "Organization ID is required" }),
  })
  .strict();

export const removeOrgMemberSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
  })
  .strict();

export const checkNamespaceAvailabilitySchema = z
  .object({
    namespace: z
      .string()
      .min(3, { message: "Namespace must be at least 3 characters long" })
      .max(30, { message: "Namespace must be at most 30 characters long" })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Namespace can only contain letters, numbers, underscores, and hyphens",
      }),
  })
  .strict();

export const businessFormDataSchema = z
  .object({
    displayName: z.string().min(1, { message: "Display name is required" }),
    namespace: z
      .string()
      .min(3, { message: "Namespace must be at least 3 characters long" })
      .max(30, { message: "Namespace must be at most 30 characters long" })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Namespace can only contain letters, numbers, underscores, and hyphens",
      }),
    lightLogoUrl: z
      .url({ message: "Invalid URL" })
      .or(z.literal(""))
      .optional(),
    darkLogoUrl: z.url({ message: "Invalid URL" }).or(z.literal("")).optional(),
    tagline: z.string().optional(),
    phone: z.string().min(1, { message: "Phone number is required" }),
    alternativePhone: z.string().optional(),
    businessEmail: z.string().email({ message: "Invalid email address" }),
    website: z.url({ message: "Invalid URL" }),
    address: z.string().min(5, { message: "Address is required" }),
    country: z.string().length(2).max(2, { message: "Country is required" }),
    state: z.string().length(2).min(1, { message: "State is required" }),
    postalCode: z.string().min(1, { message: "Postal code is required" }),
    // Social Links
    facebookUrl: z.url({ message: "Invalid URL" }).or(z.literal("")).optional(),
    twitterUrl: z.url({ message: "Invalid URL" }).or(z.literal("")).optional(),
    linkedinUrl: z.url({ message: "Invalid URL" }).or(z.literal("")).optional(),
    instagramUrl: z
      .url({ message: "Invalid URL" })
      .or(z.literal(""))
      .optional(),
    youtubeUrl: z.url({ message: "Invalid URL" }).or(z.literal("")).optional(),
    googleMapUrl: z
      .url({ message: "Invalid URL" })
      .or(z.literal(""))
      .optional(),
    coverImageUrl: z.url({ message: "Invalid URL" }).optional(),
    featuredImages: z
      .array(
        z.object({
          id: z.string(),
          value: z.url({ message: "Invalid URL" }),
        }),
      )
      .max(8)
      .optional(),
    platform: z
      .enum(["computer", "photography", "other"], {
        message: "Platform must be one of: computer, photography, other",
      })
      .optional(),
  })
  .strict();
