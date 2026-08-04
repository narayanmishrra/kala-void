/* ============================================================
   BLCK VOID — lib/validations.ts
   All Zod validation schemas for API routes + forms.
   ============================================================ */

import { z } from 'zod'

// ─── CONTACT FORM ────────────────────────────────────────────

export const budgetOptions = [
  'under-1k',
  '1k-5k',
  '5k-20k',
  '20k-plus',
] as const

export type BudgetOption = (typeof budgetOptions)[number]

export const budgetLabels: Record<BudgetOption, string> = {
  'under-1k': 'Under $1,000/mo',
  '1k-5k': '$1,000 – $5,000/mo',
  '5k-20k': '$5,000 – $20,000/mo',
  '20k-plus': '$20,000+/mo',
}

export const serviceOptions = [
  'web-development',
  'meta-google-ads',
  'lead-generation',
  '3d-animation-vfx',
  'ui-ux-design',
  'whatsapp-marketing',
] as const

export type ServiceOption = (typeof serviceOptions)[number]

export const contactSchema = z.object({
  website: z.string().max(0).optional(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[\p{L}\p{M}\s\-'.]+$/u, 'Name contains invalid characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  company: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name is too long'),
  budget: z.enum(budgetOptions, {
    errorMap: () => ({ message: 'Please select a budget range' }),
  }),
  services: z
    .array(z.enum(serviceOptions))
    .min(1, 'Please select at least one service')
    .max(6, 'Invalid service selection'),
  message: z
    .string()
    .max(2000, 'Message is too long (max 2000 characters)')
    .optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// ─── NEWSLETTER FORM ─────────────────────────────────────────

export const newsletterSchema = z.object({
  website: z.string().max(0).optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
})

export type NewsletterFormData = z.infer<typeof newsletterSchema>
