import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VeiculoAtivoHeader } from '@/components/VeiculoAtivoHeader'
import { CabecalhoPagina } from '@/components/CabecalhoPagina'

type Abastecimento = {
  id: string
  data: string
  tipo_combustivel: string
  preco_litro: number
  litros: number
  valor_total: number
  km_registro: number
  posto: string | null
}

export default async function ConsumoPage() {
  const supabase = await createClient()

  const veiculos = await buscarVeiculos(supabase)
  const veiculoAtivo = veiculos?.find((v: any) => v.eh_veiculo_ativo)

  if (!veiculoAtivo) {
    return <TelaSemVeiculo />
  }

  const abastecimentos = await buscarAbastecimentos(supabase, veiculoAtivo.id)
  const metricas = calcularMetricas(abastecimentos)

  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Consumo" />

      <VeiculoAtivoHeader modelo={veiculoAtivo.modelo} placa={veiculoAtivo.placa} />

      <CardsMetricas metricas={metricas} />

      <div className="mt-4">
        <Link
          href="/consumo/novo"
          className="inline-block rounded-xl bg-action px-4 py-3 text-sm font-bold text-base"
        >
          + Novo abastecimento
        </Link>
      </div>

      <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-text-faint">
        Ultimos abastecimentos
      </h3>
      <ListaAbastecimentos abastecimentos={abastecimentos} />
    </div>
  )
}

async function buscarVeiculos(supabase: any) {
  const resposta = await supabase.from('veiculos').select('*').eq('ativo', true)
  return resposta.data
}

async function buscarAbastecimentos(supabase: any, veiculoId: string) {
  const resposta = await supabase
    .from('abastecimentos')
    .select('*')
    .eq('veiculo_id', veiculoId)
    .order('data', { ascending: false })
    .order('km_registro', { ascending: false })

  return (resposta.data || []) as Abastecimento[]
}

function calcularMetricas(abastecimentos: Abastecimento[]) {
  if (abastecimentos.length < 2) {
    return { mediaKmL: null, custoPorKm: null }
  }

  const ordenados = [...abastecimentos].sort((a, b) => a.km_registro - b.km_registro)

  const primeiro = ordenados[0]
  const ultimo = ordenados[ordenados.length - 1]

  const kmPercorridos = ultimo.km_registro - primeiro.km_registro

  let litrosTotais = 0
  let valorTotal = 0
  for (let i = 1; i < ordenados.length; i++) {
    litrosTotais = litrosTotais + ordenados[i].litros
    valorTotal = valorTotal + ordenados[i].valor_total
  }

  if (litrosTotais === 0 || kmPercorridos <= 0) {
    return { mediaKmL: null, custoPorKm: null }
  }

  const mediaKmL = kmPercorridos / litrosTotais
  const custoPorKm = valorTotal / kmPercorridos

  return { mediaKmL, custoPorKm }
}

function TelaSemVeiculo() {
  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Consumo" />
      <p className="mt-2 text-sm text-text-dim">Nenhum veiculo ativo selecionado.</p>
    </div>
  )
}

function CardsMetricas({
  metricas,
}: {
  metricas: { mediaKmL: number | null; custoPorKm: number | null }
}) {
  const mediaTexto = metricas.mediaKmL === null ? '-' : metricas.mediaKmL.toFixed(1)
  const custoTexto =
    metricas.custoPorKm === null ? '-' : metricas.custoPorKm.toFixed(2).replace('.', ',')

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-[10px] font-bold uppercase text-text-faint">Media geral</div>
        <div className="mt-1 font-mono text-xl text-meta">{mediaTexto} km/l</div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-[10px] font-bold uppercase text-text-faint">Custo/km</div>
        <div className="mt-1 font-mono text-xl text-action">R$ {custoTexto}</div>
      </div>
    </div>
  )
}

function ListaAbastecimentos({ abastecimentos }: { abastecimentos: Abastecimento[] }) {
  if (abastecimentos.length === 0) {
    return <p className="text-sm text-text-faint">Nenhum abastecimento registrado ainda.</p>
  }

  return (
    <>
      {abastecimentos.map((a) => (
        <CardAbastecimento key={a.id} abastecimento={a} />
      ))}
    </>
  )
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function textoCombustivel(tipo: string) {
  if (tipo === 'gasolina') return 'GASOLINA'
  if (tipo === 'etanol') return 'ETANOL'
  return 'DIESEL'
}

function CardAbastecimento({ abastecimento }: { abastecimento: Abastecimento }) {
  const valorFormatado = abastecimento.valor_total.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  })
  const precoFormatado = abastecimento.preco_litro.toFixed(2).replace('.', ',')
  const kmFormatado = abastecimento.km_registro.toLocaleString('pt-BR')

  return (
    <div className="mb-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-action/15 px-2 py-1 text-[10px] font-bold text-action">
            {textoCombustivel(abastecimento.tipo_combustivel)}
          </span>
          <span className="text-xs text-text-faint">{formatarData(abastecimento.data)}</span>
        </div>
        <span className="font-mono text-sm font-bold text-text">R$ {valorFormatado}</span>
      </div>

      <div className="mt-2 flex justify-between text-xs text-text-dim">
        <span>R$ {precoFormatado}/L</span>
        <span className="font-mono">{kmFormatado} km</span>
        <span>{abastecimento.posto || '-'}</span>
      </div>
    </div>
  )
}