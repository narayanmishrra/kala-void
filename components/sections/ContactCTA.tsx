/* ============================================================
   BLCK VOID — components/sections/ContactCTA.tsx
   ============================================================ */

'use client'

import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { PillButton } from '@/components/ui/PillButton'
import { fadeUp, staggerContainer, reducedFadeUp, reducedContainer } from '@/lib/animations'
import { budgetOptions, budgetLabels, serviceOptions, contactSchema } from '@/lib/validations'
import type { BudgetOption, ServiceOption } from '@/lib/validations'
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react'

const serviceLabels: Record<ServiceOption, string> = {
  'web-development': 'Web Development',
  'meta-google-ads': 'Meta Ads',
  'lead-generation': 'Lead Generation',
  '3d-animation-vfx': '3D Animation',
  'ui-ux-design': 'UI/UX Design',
  'whatsapp-marketing': 'WhatsApp Marketing',
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReduced = useReducedMotion()

  const itemVariant = prefersReduced ? reducedFadeUp : fadeUp
  const containerVariant = prefersReduced ? reducedContainer : staggerContainer
  const animate = isInView ? 'visible' : 'hidden'

  // Form state
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    budget: '' as BudgetOption | '',
    services: [] as ServiceOption[],
    message: '',
  })

  const toggleService = (service: ServiceOption) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = contactSchema.safeParse({
      ...form,
      website: '',
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const [key, errs] of Object.entries(result.error.flatten().fieldErrors)) {
        if (errs && errs.length > 0) fieldErrors[key] = errs[0]
      }
      setErrors(fieldErrors)
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: '' }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputClass = 'w-full bg-transparent border-none border-b border-[rgba(255,255,255,0.15)] py-3 px-0 outline-none font-[family-name:var(--font-ppneuemontreal)] text-[18px] font-extralight text-white placeholder:text-[#9a9a9a] focus:border-b-[#8052ff] transition-[border-color] duration-200'

  return (
    <section
      ref={ref}
      style={{ paddingTop: 120, paddingBottom: 120, position: 'relative' }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 60% 50%, rgba(128,82,255,0.04) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="container-page relative z-10"
        variants={containerVariant}
        initial={animate === 'hidden' ? 'hidden' : undefined}
        animate={animate}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-[60px] items-start">
          {/* Left: Heading */}
          <div>
            <motion.div variants={itemVariant}>
              <SectionLabel text="Start the Conversation" />
            </motion.div>
            <motion.h2
              variants={itemVariant}
              className="type-heading-lg"
              style={{ color: '#ffffff', marginTop: 24 }}
            >
              Ready to leave<br />
              the <span style={{ color: '#8052ff' }}>void</span> behind?
            </motion.h2>
            <motion.p
              variants={itemVariant}
              className="type-body"
              style={{ color: '#bdbdbd', maxWidth: 480, marginTop: 24 }}
            >
              Tell us where you are, what is not working, and where you want to go.
              We will show you the shortest path between the two.
            </motion.p>
            <motion.div variants={itemVariant} className="mt-12 flex flex-col gap-2">
              <span
                className="type-label"
                style={{ color: '#9a9a9a' }}
              >
                hello@blckvoid.com
              </span>
              <span
                className="type-label"
                style={{ color: '#9a9a9a' }}
              >
                Response within 24 hours
              </span>
            </motion.div>
          </div>

          {/* Right: Form */}
          <motion.div variants={itemVariant}>
            {status === 'success' ? (
              <div className="py-8" aria-live="polite">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={24} className="text-[#ffb829]" />
                  <span className="type-label" style={{ color: '#ffb829' }}>
                    MESSAGE RECEIVED. WE&apos;LL BE IN TOUCH.
                  </span>
                </div>
                <p className="type-body" style={{ color: '#bdbdbd' }}>
                  We respond to every inquiry within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="contact-form" noValidate>
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-8">
                  {/* Name */}
                  <div>
                    <label className="type-label block mb-2" style={{ color: '#9a9a9a' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      required
                    />
                    {errors.name && <span className="text-[#ff6b6b] text-[12px] mt-1 block">{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="type-label block mb-2" style={{ color: '#9a9a9a' }}>
                      Business Email
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@company.com"
                      required
                    />
                    {errors.email && <span className="text-[#ff6b6b] text-[12px] mt-1 block">{errors.email}</span>}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="type-label block mb-2" style={{ color: '#9a9a9a' }}>
                      Company
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.company}
                      onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                      placeholder="Your company"
                      required
                    />
                    {errors.company && <span className="text-[#ff6b6b] text-[12px] mt-1 block">{errors.company}</span>}
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="type-label block mb-2" style={{ color: '#9a9a9a' }}>
                      Monthly Marketing Budget
                    </label>
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      value={form.budget}
                      onChange={e => setForm(p => ({ ...p, budget: e.target.value as BudgetOption }))}
                      required
                    >
                      <option value="" disabled>Select budget range</option>
                      {budgetOptions.map(opt => (
                        <option key={opt} value={opt} style={{ background: '#000', color: '#fff' }}>
                          {budgetLabels[opt]}
                        </option>
                      ))}
                    </select>
                    {errors.budget && <span className="text-[#ff6b6b] text-[12px] mt-1 block">{errors.budget}</span>}
                  </div>

                  {/* Services */}
                  <div>
                    <label className="type-label block mb-3" style={{ color: '#9a9a9a' }}>
                      Services Interested In
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map(service => {
                        const isSelected = form.services.includes(service)
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`inline-flex items-center px-3 py-2 rounded-full border text-[12px] font-semibold uppercase tracking-[0.35px] font-[family-name:var(--font-ppneuemontreal)] transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'bg-[#8052ff] border-[#8052ff] text-white'
                                : 'bg-transparent border-[rgba(255,255,255,0.2)] text-[#9a9a9a] hover:border-[rgba(255,255,255,0.4)]'
                            }`}
                          >
                            {serviceLabels[service]}
                          </button>
                        )
                      })}
                    </div>
                    {errors.services && <span className="text-[#ff6b6b] text-[12px] mt-1 block">{errors.services}</span>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="type-label block mb-2" style={{ color: '#9a9a9a' }}>
                      What are you trying to achieve?
                    </label>
                    <textarea
                      className={`${inputClass} resize-y min-h-[120px]`}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us about your goals..."
                      rows={4}
                      maxLength={2000}
                    />
                    {form.message.length > 0 && (
                      <span className="text-[#9a9a9a] text-[12px] mt-1 block">
                        {form.message.length}/2000
                      </span>
                    )}
                    {errors.message && <span className="text-[#ff6b6b] text-[12px] mt-1 block">{errors.message}</span>}
                  </div>

                  {/* Submit */}
                  <div aria-live="polite">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto flex items-center gap-2"
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          SENDING...
                        </>
                      ) : (
                        <>
                          SEND IT INTO THE VOID
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                    {status === 'error' && (
                      <span className="text-[#ff6b6b] text-[12px] mt-2 block">
                        Something went wrong. Please try again or email us directly.
                      </span>
                    )}
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
