import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CabecalhoPagina } from '@/components/CabecalhoPagina'

type Peca = {
  id: string
  nome_marca: string
  codigo: string | null
  vida_util_prometida_km: number | null
  categorias_peca: {
    nome: string
  } | null
}

export default async function PecasPage() {
  const supabase = await createClient()
  const resposta = await supabase
    .from('pecas_catalogo')
    .select('id, nome_marca, codigo, vida_util_prometida_km, categorias_peca(nome)')
    .eq('ativo', true)
    .order('nome_marca')

  const pecas = (resposta.data || []) as unknown as Peca[]

  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Catalogo de pecas" />
      <p className="mb-6 text-xs uppercase tracking-wide text-text-faint">
        Pecas cadastradas
      </p>

      <Link
        href="/pecas/novo"
        className="mb-6 inline-block rounded-xl bg-action px-4 py-3 text-sm font-bold text-base"
      >
        + Nova peca
      </Link>

      <ListaPecas pecas={pecas} />
    </div>
  )
}

function ListaPecas({ pecas }: { pecas: Peca[] }) {
  if (pecas.length === 0) {
    return <p className="text-sm text-text-faint">Nenhuma peca cadastrada ainda.</p>
  }

  return (
    <>
      {pecas.map((p) => (
        <CardPeca key={p.id} peca={p} />
      ))}
    </>
  )
}

function CardPeca({ peca }: { peca: Peca }) {
  const categoriaNome = peca.categorias_peca?.nome || 'Sem categoria'
  const vidaUtil = peca.vida_util_prometida_km
    ? peca.vida_util_prometida_km.toLocaleString('pt-BR') + ' km'
    : 'Nao informada'

  return (
    <div className="mb-3 rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wide text-text-faint">
        {categoriaNome}
      </div>
      <div className="mt-1 text-sm font-semibold text-text">{peca.nome_marca}</div>
      {peca.codigo && (
        <div className="font-mono text-xs text-text-faint">{peca.codigo}</div>
      )}
      <div className="mt-2 text-xs text-text-dim">
        Vida util prometida: {vidaUtil}
      </div>
    </div>
  )
}