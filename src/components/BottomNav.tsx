'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITENS = [
  { href: '/dashboard', label: 'Dashboard', icone: 'dashboard' },
  { href: '/historico', label: 'Historico', icone: 'historico' },
  { href: '/comparar', label: 'Comparar', icone: 'comparar' },
  { href: '/consumo', label: 'Consumos', icone: 'consumo' },
  { href: '/veiculos', label: 'Veiculos', icone: 'veiculos' },
  { href: '/pecas', label: 'Pecas', icone: 'pecas' },
  { href: '/relatorio', label: 'Relatorio', icone: 'relatorio' },
]

const ROTAS_COM_NAV = [
  '/dashboard',
  '/historico',
  '/comparar',
  '/consumo',
  '/veiculos',
  '/pecas',
  '/relatorio',
]

export function BottomNav() {
  const pathname = usePathname()

  const deveMostrar = ROTAS_COM_NAV.some((rota) => pathname === rota)

  if (!deveMostrar) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto flex w-full max-w-md justify-around border-t border-border bg-surface px-1 py-2">
      {ITENS.map((item) => (
        <ItemNav key={item.href} item={item} ativo={pathname === item.href} />
      ))}
    </nav>
  )
}

function ItemNav({
  item,
  ativo,
}: {
  item: { href: string; label: string; icone: string }
  ativo: boolean
}) {
  const corTexto = ativo ? 'text-action' : 'text-text-faint'
  const pasta = ativo ? '' : 'cinza/'
  const caminhoIcone = '/images/icones/' + pasta + item.icone + '.png'

  return (
    <Link href={item.href} className="flex flex-col items-center gap-1 px-1">
      <Image src={caminhoIcone} alt="" width={20} height={20} />
      <span className={'text-[9px] font-semibold ' + corTexto}>{item.label}</span>
    </Link>
  )
}