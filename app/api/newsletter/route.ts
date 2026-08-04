/* ============================================================
   BLCK VOID — app/api/newsletter/route.ts
   Newsletter signup endpoint.
   ============================================================ */

import { NextRequest, NextResponse } from 'next/server'
import { newsletterSchema } from '@/lib/validations'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let rawData: unknown
  try {
    rawData = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot
  const data = rawData as Record<string, unknown>
  if (typeof data.website === 'string' && data.website.length > 0) {
    return NextResponse.json({ success: true })
  }

  const result = newsletterSchema.safeParse(rawData)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', fields: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  // In production, add to newsletter service
  console.log('[Newsletter API] Signup:', result.data.email)

  return NextResponse.json({ success: true }, { status: 200 })
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
