/* ============================================================
   BLCK VOID — app/api/contact/route.ts
   Contact form submission handler.
   ============================================================ */

import { NextRequest, NextResponse } from 'next/server'
import { contactSchema } from '@/lib/validations'

function sanitizeString(input: string): string {
  return input
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Simple in-memory rate limit (for production, use Upstash Redis)
const submissions = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = submissions.get(ip)

  if (!entry || now > entry.resetAt) {
    submissions.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT) {
    return false
  }

  entry.count++
  return true
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit
  const ip = getClientIP(request)
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '3600' } }
    )
  }

  // Parse JSON
  let rawData: unknown
  try {
    const text = await request.text()
    if (text.length > 32768) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
    rawData = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot
  const data = rawData as Record<string, unknown>
  if (typeof data.website === 'string' && data.website.length > 0) {
    return NextResponse.json({ success: true })
  }

  // Validate
  const result = contactSchema.safeParse(rawData)
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        fields: result.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  // Sanitize
  const safe = {
    name: sanitizeString(result.data.name),
    email: sanitizeString(result.data.email),
    company: sanitizeString(result.data.company),
    budget: result.data.budget,
    services: result.data.services,
    message: result.data.message ? sanitizeString(result.data.message) : undefined,
  }

  // In production, send via Resend API
  // For now, log and return success
  console.log('[Contact API] New lead:', {
    name: safe.name,
    email: safe.email,
    company: safe.company,
    budget: safe.budget,
    services: safe.services.join(', '),
  })

  return NextResponse.json(
    { success: true, message: 'Message received.' },
    { status: 200 }
  )
}

// Reject other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
