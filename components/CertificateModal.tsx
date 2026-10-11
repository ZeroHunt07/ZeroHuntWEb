'use client'

import React, { useRef } from 'react'
import { Shield, Award, CheckCircle2, Download, ExternalLink, X, Printer, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export interface CertificateData {
  _id?: string
  certificateId: string
  userId: string
  username: string
  userDisplayName?: string
  courseSlug: string
  courseTitle: string
  quizId?: string
  quizTitle?: string
  score: number
  grade: 'Distinction' | 'Proficient' | 'Certified'
  issuedAt: string | Date
  signature: string
}

interface CertificateModalProps {
  certificate: CertificateData | null
  isOpen: boolean
  onClose: () => void
}

export function CertificateModal({ certificate, isOpen, onClose }: CertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !certificate) return null

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8">
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-3 text-white/80 print:hidden">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FF4D5E]">
            <Shield size={14} />
            <span>OFFICIAL OPERATIVE CREDENTIAL</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="border-white/10 text-white hover:bg-white/10 text-xs font-mono h-8 gap-1.5"
            >
              <Printer size={13} /> PRINT / PDF
            </Button>
            <Link href={`/certificates/${certificate.certificateId}`} target="_blank">
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10 text-xs font-mono h-8 gap-1.5"
              >
                <ExternalLink size={13} /> VERIFY LINK
              </Button>
            </Link>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-2"
              aria-label="Close certificate"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* The Printable Certificate Canvas */}
        <div
          ref={printRef}
          className="relative rounded-2xl p-8 sm:p-12 overflow-hidden border border-[#FF4D5E]/30 shadow-[0_0_80px_rgba(255,77,94,0.15)] bg-[#070b10] text-white print:p-8 print:border-2 print:border-black print:bg-white print:text-black"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 50% 0%, rgba(255,77,94,0.12) 0%, transparent 65%),
              linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.6) 100%)
            `,
          }}
        >
          {/* Cyber Decorative Grid & Watermark */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 77, 94, 0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] font-black text-8xl tracking-widest pointer-events-none select-none font-mono print:hidden">
            ZERO HUNT
          </div>

          {/* Corner Cyber Brackets */}
          <div className="absolute top-3 left-3 size-4 border-t-2 border-l-2 border-[#FF4D5E]/60" />
          <div className="absolute top-3 right-3 size-4 border-t-2 border-r-2 border-[#FF4D5E]/60" />
          <div className="absolute bottom-3 left-3 size-4 border-b-2 border-l-2 border-[#FF4D5E]/60" />
          <div className="absolute bottom-3 right-3 size-4 border-b-2 border-r-2 border-[#FF4D5E]/60" />

          {/* Header */}
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-[#FF4D5E] text-xs font-mono mb-4 tracking-widest">
              <Shield size={13} />
              ZERO HUNT SECURITY ACADEMY
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white font-mono">
              Certificate of Completion
            </h2>
            <p className="text-xs font-mono text-white/50 tracking-widest mt-1 uppercase">
              Official Cyber Operative Accreditation
            </p>
          </div>

          {/* Recipient */}
          <div className="text-center my-8 relative z-10">
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
              This credential certifies that
            </p>
            <div className="my-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/70">
                {certificate.userDisplayName || certificate.username}
              </h1>
              <p className="text-sm font-mono text-[#FF4D5E] mt-1 font-semibold">
                @{certificate.username}
              </p>
            </div>
            <p className="text-xs font-mono text-white/60 max-w-lg mx-auto mt-3 leading-relaxed">
              has successfully passed the verified hands-on evaluation and demonstrated proficiency in the curriculum of
            </p>
            <div className="mt-3 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 inline-block">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                {certificate.courseTitle}
              </h3>
            </div>
          </div>

          {/* Metrics & Assessment Breakdown */}
          <div className="grid grid-cols-3 gap-3 my-6 max-w-lg mx-auto relative z-10 text-center">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-mono text-white/40 block">EXAM SCORE</span>
              <span className="text-xl font-bold font-mono text-[#FF4D5E]">{certificate.score}%</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-mono text-white/40 block">HONOR GRADE</span>
              <span className="text-xl font-bold font-mono text-white">{certificate.grade}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-mono text-white/40 block">STATUS</span>
              <span className="text-xl font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 size={16} /> VERIFIED
              </span>
            </div>
          </div>

          {/* Footer Signature & Verification Block */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 flex items-center justify-center text-[#FF4D5E]">
                <Award size={24} />
              </div>
              <div className="text-left">
                <span className="text-white/40 block text-[10px]">ISSUED DATE</span>
                <span className="text-white font-medium">{issuedDate}</span>
                <span className="text-white/40 block text-[10px] mt-1">ISSUING AUTHORITY</span>
                <span className="text-white/70">Zero Hunt Security Directorate</span>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-white/40 block text-[10px]">VERIFICATION ID</span>
              <span className="font-mono text-[#FF4D5E] font-bold tracking-wider">{certificate.certificateId}</span>
              <span className="text-white/40 block text-[10px] mt-1">HASH SIGNATURE</span>
              <span className="text-white/50 text-[10px] font-mono tracking-tighter">
                {certificate.signature.substring(0, 16)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
