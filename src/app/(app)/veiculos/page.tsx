import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CabecalhoPagina } from '@/components/CabecalhoPagina'
import { selecionarVeiculoAtivo } from './actions'

type Veiculo = {
  id: string
  modelo: string
  placa: string
  km_atual: number
  eh_veiculo_ativo: boolean
}

export default async function VeiculosPage() {
  const supabase = await createClient()
  const veiculos = await buscarVeiculos(supabase)

  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Meus veiculos" />
      <p className="mb-6 text-xs uppercase tracking-wide text-text-faint">Gerenciar</p>

      <ListaVeiculos veiculos={veiculos} />

      <Link
        href="/veiculos/novo"
        className="mt-4 inline-block text-sm font-bold text-action"
      >
        + Adicionar veiculo
      </Link>
    </div>
  )
}

async function buscarVeiculos(supabase: any) {
  const resposta = await supabase
    .from('veiculos')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  return (resposta.data || []) as Veiculo[]
}

function ListaVeiculos({ veiculos }: { veiculos: Veiculo[] }) {
  if (veiculos.length === 0) {
    return <p className="text-sm text-text-faint">Nenhum veiculo cadastrado ainda.</p>
  }

  return (
    <>
      {veiculos.map((v) => (
        <CardVeiculo key={v.id} veiculo={v} />
      ))}
    </>
  )
}

function CardVeiculo({ veiculo }: { veiculo: Veiculo }) {
  const bordaBase = 'mb-3 rounded-xl border bg-surface p-4 '
  const bordaCor = veiculo.eh_veiculo_ativo ? 'border-action ' : 'border-border '
  const classeFinal = bordaBase + bordaCor
  const kmFormatado = veiculo.km_atual.toLocaleString('pt-BR')
  const linhaInfo = veiculo.placa + ' - ' + kmFormatado + ' km'

  return (
    <div className={classeFinal}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-text">{veiculo.modelo}</div>
          <div className="font-mono text-xs text-text-faint">{linhaInfo}</div>
        </div>

        <BotaoStatus veiculo={veiculo} />
      </div>
    </div>
  )
}

function BotaoStatus({ veiculo }: { veiculo: Veiculo }) {
  if (veiculo.eh_veiculo_ativo) {
    return (
      <span className="rounded-full bg-meta/15 px-2 py-1 text-[10px] font-bold text-meta">
        ATIVO
      </span>
    )
  }

  const acaoComId = selecionarVeiculoAtivo.bind(null, veiculo.id)

  return (
    <form action={acaoComId}>
      <button
        type="submit"
        className="rounded-full border border-border px-3 py-1 text-[10px] font-bold text-text-dim"
      >
        SELECIONAR
      </button>
    </form>
  )
}