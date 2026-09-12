import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VeiculoAtivoHeader } from '@/components/VeiculoAtivoHeader'
import { CabecalhoPagina } from '@/components/CabecalhoPagina'

type PecaAplicada = {
  id: string
  valor_pago: number | null
  local_compra: string | null
  motivo_troca: string
  km_inicio: number | null
  km_fim: number | null
  pecas_catalogo: {
    nome_marca: string
    codigo: string | null
    categorias_peca: {
      nome: string
    } | null
  } | null
}

type Manutencao = {
  id: string
  tipo: string
  data: string
  km_registro: number
  oficina: string | null
  valor_mao_obra: number | null
  observacoes: string | null
  manutencao_pecas: PecaAplicada[] | null
}

export default async function HistoricoPage() {
  const supabase = await createClient()

  const veiculos = await buscarVeiculos(supabase)
  const veiculoAtivo = veiculos?.find((v: any) => v.eh_veiculo_ativo)

  if (!veiculoAtivo) {
    return <TelaSemVeiculo />
  }

  const manutencoes = await buscarManutencoes(supabase, veiculoAtivo.id)

  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Histórico" />

      <VeiculoAtivoHeader modelo={veiculoAtivo.modelo} placa={veiculoAtivo.placa} />

      <div className="mt-4">
        <Link
          href="/historico/nova"
          className="inline-block rounded-xl bg-action px-4 py-3 text-sm font-bold text-base"
        >
          + Nova manutenção
        </Link>
      </div>

      <div className="mt-6">
        <ListaManutencoes manutencoes={manutencoes} />
      </div>
    </div>
  )
}

async function buscarVeiculos(supabase: any) {
  const resposta = await supabase.from('veiculos').select('*').eq('ativo', true)
  return resposta.data
}

async function buscarManutencoes(supabase: any, veiculoId: string) {
  const resposta = await supabase
    .from('manutencoes')
    .select(`
      id,
      tipo,
      data,
      km_registro,
      oficina,
      valor_mao_obra,
      observacoes,
      manutencao_pecas (
        id,
        valor_pago,
        local_compra,
        motivo_troca,
        km_inicio,
        km_fim,
        pecas_catalogo ( nome_marca, codigo, categorias_peca ( nome ) )
      )
    `)
    .eq('veiculo_id', veiculoId)
    .order('data', { ascending: false })

  return resposta.data as Manutencao[] | null
}

function TelaSemVeiculo() {
  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Historico" />
      <p className="mt-2 text-sm text-text-dim">Nenhum veiculo ativo selecionado.</p>
    </div>
  )
}

function ListaManutencoes({ manutencoes }: { manutencoes: Manutencao[] | null }) {
  if (!manutencoes || manutencoes.length === 0) {
    return <p className="text-sm text-text-faint">Nenhuma manutencao registrada ainda.</p>
  }

  return (
    <>
      {manutencoes.map((m) => (
        <CardManutencao key={m.id} manutencao={m} />
      ))}
    </>
  )
}

function calcularTotal(manutencao: Manutencao) {
  const maoObra = manutencao.valor_mao_obra || 0
  const pecas = manutencao.manutencao_pecas || []

  let totalPecas = 0
  for (const p of pecas) {
    totalPecas = totalPecas + (p.valor_pago || 0)
  }

  return maoObra + totalPecas
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function CardManutencao({ manutencao }: { manutencao: Manutencao }) {
  const total = calcularTotal(manutencao)
  const totalFormatado = total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const kmFormatado = manutencao.km_registro.toLocaleString('pt-BR')
  const pecas = manutencao.manutencao_pecas || []

  return (
    <div className="mb-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-text-dim">{formatarData(manutencao.data)}</span>
          <BadgeTipo tipo={manutencao.tipo} />
        </div>
        <span className="font-mono text-xs text-text-faint">{kmFormatado} km</span>
      </div>

      {manutencao.oficina && (
        <div className="mt-2 text-sm text-text-dim">{manutencao.oficina}</div>
      )}

      {pecas.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-text-faint">
            Pecas aplicadas
          </div>
          {pecas.map((p) => (
            <LinhaPeca key={p.id} peca={p} />
          ))}
        </div>
      )}

      {manutencao.observacoes && (
        <div className="mt-3 text-xs italic text-text-faint">{manutencao.observacoes}</div>
      )}

      <div className="mt-3 font-mono text-sm font-bold text-text">R$ {totalFormatado}</div>
    </div>
  )
}

function BadgeTipo({ tipo }: { tipo: string }) {
  const ehPreventiva = tipo === 'preventiva'
  const classe = ehPreventiva ? 'bg-meta/15 text-meta' : 'bg-action/15 text-action'
  const texto = ehPreventiva ? 'PREVENTIVA' : 'CORRETIVA'

  return (
    <span className={'rounded-full px-2 py-1 text-[10px] font-bold ' + classe}>
      {texto}
    </span>
  )
}

function LinhaPeca({ peca }: { peca: PecaAplicada }) {
  const categoria = peca.pecas_catalogo?.categorias_peca?.nome || ''
  const marca = peca.pecas_catalogo?.nome_marca || ''

  let duracao = ''
  if (peca.km_fim !== null && peca.km_inicio !== null) {
    const km = (peca.km_fim - peca.km_inicio).toLocaleString('pt-BR')
    duracao = ' (durou ' + km + ' km)'
  }

  return (
    <div className="text-sm text-text-dim">
      - {categoria}: {marca}
      {duracao && <span className="text-text-faint">{duracao}</span>}
    </div>
  )
}