import Link from 'next/link'

type CabecalhoPaginaProps = {
  titulo: string
}

export function CabecalhoPagina({ titulo }: CabecalhoPaginaProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-text">{titulo}</h1>
      <Link
        href="/inicio"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-dim"
      >
        <IconeCasa />
      </Link>
    </div>
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