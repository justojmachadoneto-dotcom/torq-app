'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

type BotaoVoltarProps = {
  titulo: string
  subtitulo?: string
}

export function BotaoVoltar({ titulo, subtitulo }: BotaoVoltarProps) {
  const router = useRouter()

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text"
        >
          <IconeSeta />
        </button>

        <div>
          <div className="text-xl font-bold text-text">{titulo}</div>
          {subtitulo && (
            <div className="text-[11px] uppercase tracking-wide text-text-faint">
              {subtitulo}
            </div>
          )}
        </div>
      </div>

      <Link
        href="/inicio"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-dim"
      >
        <IconeCasa />
      </Link>
    </div>
  )
}

function IconeSeta() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconeCasa() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5L12 4l8 7.5M6 10v9h5v-5h2v5h5v-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}