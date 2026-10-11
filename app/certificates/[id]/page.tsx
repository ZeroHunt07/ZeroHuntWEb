'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Award,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CertificateRecord {
  _id: string
  certificateId: string
  userId: string
  username: string
  userDisplayName?: string
  courseSlug: string
  courseTitle: string
  score: number
  grade: 'Distinction' | 'Proficient' | 'Certified'
  issuedAt: string
  signature: string
}

export default function CertificateVerificationPage() {
  const params = useParams()
  const id = params?.id as string

  const [cert, setCert] = useState<CertificateRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchCert = async () => {
      try {
        const res = await fetch(`/api/certificates/${id}`)
        if (!res.ok) {
          setError('Credential not found in Zero Hunt registry. It may be invalid or expired.')
          setLoading(false)
          return
        }
        const data = await res.json()
        setCert(data)
      } catch {
        setError('Failed to reach verification registry.')
      } finally {
        setLoading(false)
      }
    }
    fetchCert()
  }, [id])

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-[#070b10] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10 print:hidden">
        <Link href="/" className="inline-flex items-center gap-2 font-mono font-bold text-white hover:text-[#FF4D5E] transition-colors">
          <Shield size={20} className="text-[#FF4D5E]" />
          <span>ZERO HUNT</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="text-xs font-mono text-white/60 hover:text-white">
              <ArrowLeft size={14} className="mr-1" /> COURSES
            </Button>
          </Link>
          <Link href="/quizzes">
            <Button variant="ghost" size="sm" className="text-xs font-mono text-white/60 hover:text-white">
              QUIZZES
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-3xl mx-auto w-full my-auto py-10">
        {loading ? (
          <div className="text-center py-24 font-mono text-white/50 animate-pulse">
            <Shield size={36} className="mx-auto mb-4 text-[#FF4D5E] animate-spin" />
            VERIFYING CREDENTIAL AGAINST SECURITY REGISTRY…
          </div>
        ) : error || !cert ? (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-md mx-auto">
            <AlertTriangle size={36} className="mx-auto mb-3 text-red-400" />
            <h2 className="text-lg font-bold font-mono text-white">INVALID CREDENTIAL</h2>
            <p className="text-xs text-white/60 mt-2 font-mono">{error}</p>
            <Link href="/" className="inline-block mt-6">
              <Button size="sm" className="bg-[#FF4D5E] text-[#071007] font-bold">
                RETURN TO ZERO HUNT
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Status Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 print:hidden">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                    OFFICIAL ZERO HUNT VERIFIED CREDENTIAL
                  </span>
                  <p className="text-[11px] text-white/60 font-mono">
                    This cryptographic record is authentic and confirmed by Zero Hunt Directorate.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyLink}
                  className="border-white/10 text-white hover:bg-white/10 text-xs font-mono h-8 gap-1.5"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {copied ? 'COPIED' : 'SHARE'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrint}
                  className="border-white/10 text-white hover:bg-white/10 text-xs font-mono h-8 gap-1.5"
                >
                  <Printer size={13} /> PRINT / PDF
                </Button>
              </div>
            </div>

            {/* Certificate Sheet */}
            <div
              className="relative rounded-2xl p-8 sm:p-14 overflow-hidden border border-[#FF4D5E]/30 bg-[#0d1218] shadow-2xl text-white print:p-8 print:border print:bg-white print:text-black"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 50% 0%, rgba(255,77,94,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.8) 100%)
                `,
              }}
            >
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 size-4 border-t-2 border-l-2 border-[#FF4D5E]" />
              <div className="absolute top-3 right-3 size-4 border-t-2 border-r-2 border-[#FF4D5E]" />
              <div className="absolute bottom-3 left-3 size-4 border-b-2 border-l-2 border-[#FF4D5E]" />
              <div className="absolute bottom-3 right-3 size-4 border-b-2 border-r-2 border-[#FF4D5E]" />

              {/* Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] font-black text-8xl tracking-widest pointer-events-none select-none font-mono print:hidden">
                ZERO HUNT
              </div>

              {/* Header */}
              <div className="text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-[#FF4D5E] text-xs font-mono mb-4 tracking-widest">
                  <Shield size={14} />
                  ZERO HUNT SECURITY ACADEMY
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase font-mono tracking-tight text-white">
                  Certificate of Completion
                </h1>
                <p className="text-xs font-mono text-white/50 tracking-widest uppercase mt-1">
                  Verified Cyber Operative Certification
                </p>
              </div>

              {/* Recipient */}
              <div className="text-center my-10 relative z-10">
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                  This certifies that operative
                </p>
                <div className="my-2">
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70">
                    {cert.userDisplayName || cert.username}
                  </h2>
                  <Link href={`/profile?u=${cert.username}`} className="inline-block mt-1 print:hidden">
                    <span className="text-sm font-mono text-[#FF4D5E] hover:underline font-semibold">
                      @{cert.username}
                    </span>
                  </Link>
                </div>
                <p className="text-xs font-mono text-white/60 max-w-lg mx-auto mt-3 leading-relaxed">
                  has demonstrated rigorous technical proficiency and successfully completed the evaluation for
                </p>
                <div className="mt-4 px-6 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 inline-block">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                    {cert.courseTitle}
                  </h3>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-3 my-8 max-w-lg mx-auto relative z-10 text-center">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10">
                  <span className="text-[10px] font-mono text-white/40 block">EXAM SCORE</span>
                  <span className="text-2xl font-bold font-mono text-[#FF4D5E]">{cert.score}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10">
                  <span className="text-[10px] font-mono text-white/40 block">GRADE</span>
                  <span className="text-2xl font-bold font-mono text-white">{cert.grade}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10">
                  <span className="text-[10px] font-mono text-white/40 block">AUTHENTICITY</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 size={18} /> PASSED
                  </span>
                </div>
              </div>

              {/* Bottom Verifier */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 flex items-center justify-center text-[#FF4D5E]">
                    <Award size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-white/40 block text-[10px]">ISSUED DATE</span>
                    <span className="text-white font-medium">
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-white/40 block text-[10px] mt-1">ISSUED BY</span>
                    <span className="text-white/70">Zero Hunt Verification Directorate</span>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-white/40 block text-[10px]">REGISTRATION ID</span>
                  <span className="font-mono text-[#FF4D5E] font-bold text-sm tracking-wider">
                    {cert.certificateId}
                  </span>
                  <span className="text-white/40 block text-[10px] mt-1">SHA-256 SIGNATURE</span>
                  <span className="text-white/50 text-[10px] font-mono">
                    {cert.signature}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 print:hidden">
              <Link href={`/courses`}>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs font-mono gap-1.5">
                  <ExternalLink size={13} /> EXPLORE ZERO HUNT ACADEMY
                </Button>
              </Link>
              <Link href={`/quizzes`}>
                <Button className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] font-bold text-xs font-mono">
                  TAKE MORE CERTIFICATION EXAMS
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-white/10 text-center font-mono text-xs text-white/40 print:hidden">
        © 2026 ZERO HUNT • VERIFIED OPERATIVE CREDENTIAL REGISTRY • SECURED PROTOCOL
      </footer>
    </main>
  )
}
