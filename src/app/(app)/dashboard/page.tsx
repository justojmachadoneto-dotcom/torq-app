import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VeiculoAtivoHeader } from '@/components/VeiculoAtivoHeader'
import { CabecalhoPagina } from '@/components/CabecalhoPagina'

type Alerta = {
  manutencao_peca_id: string
  categoria_nome: string
  nome_marca: string
  status: string
  km_restante: number | null
  dias_restante_estimado: number | null
  percentual_uso: number | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const veiculos = await buscarVeiculos(supabase)
  const veiculoAtivo = veiculos?.find((v: any) => v.eh_veiculo_ativo)

  if (!veiculoAtivo) {
    return <TelaSemVeiculo />
  }

  const alertas = await buscarAlertas(supabase, veiculoAtivo.id)
  const resumo = await buscarResumoMes(supabase, veiculoAtivo.id)

  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Boa tarde" />

      <VeiculoAtivoHeader modelo={veiculoAtivo.modelo} placa={veiculoAtivo.placa} />

      <CardKmAtual km={veiculoAtivo.km_atual} />

      <TituloSecao texto="Alertas preventivos" />
      <ListaAlertas alertas={alertas} />

      <TituloSecao texto="Resumo do mes" />
      <CardResumoMes totalManutencao={resumo.totalManutencao} totalCombustivel={resumo.totalCombustivel} />

      <AcoesRapidas />
    </div>
  )
}

async function buscarVeiculos(supabase: any) {
  const resposta = await supabase.from('veiculos').select('*').eq('ativo', true)
  return resposta.data
}

async function buscarAlertas(supabase: any, veiculoId: string) {
  const resposta = await supabase
    .from('vw_previsao_trocas')
    .select('*')
    .eq('veiculo_id', veiculoId)
    .order('percentual_uso', { ascending: false })
  return resposta.data as Alerta[] | null
}

async function buscarResumoMes(supabase: any, veiculoId: string) {
  const inicioMes = new Date()
  inicioMes.setDate(1)
  const inicioMesStr = inicioMes.toISOString().split('T')[0]

  const respostaManutencoes = await supabase
    .from('manutencoes')
    .select('valor_mao_obra, manutencao_pecas(valor_pago)')
    .eq('veiculo_id', veiculoId)
    .gte('data', inicioMesStr)

  const respostaAbastecimentos = await supabase
    .from('abastecimentos')
    .select('valor_total')
    .eq('veiculo_id', veiculoId)
    .gte('data', inicioMesStr)

  const manutencoesMes = respostaManutencoes.data || []
  const abastecimentosMes = respostaAbastecimentos.data || []

  let totalManutencao = 0
  for (const m of manutencoesMes) {
    const maoObra = m.valor_mao_obra || 0
    let totalPecas = 0
    const pecas = m.manutencao_pecas || []
    for (const p of pecas) {
      totalPecas = totalPecas + (p.valor_pago || 0)
    }
    totalManutencao = totalManutencao + maoObra + totalPecas
  }

  let totalCombustivel = 0
  for (const a of abastecimentosMes) {
    totalCombustivel = totalCombustivel + (a.valor_total || 0)
  }

  return { totalManutencao, totalCombustivel }
}

function TelaSemVeiculo() {
  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Bem-vindo ao TORQ" />
      <p className="mt-2 text-sm text-text-dim">
        Voce ainda nao tem um veiculo cadastrado.
      </p>
      <Link href="/veiculos/novo" className="mt-4 inline-block font-semibold text-action">
        + Cadastrar veiculo
      </Link>
    </div>
  )
}

function CardKmAtual({ km }: { km: number }) {
  const kmFormatado = km.toLocaleString('pt-BR')
  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4">
      <strong className="font-mono text-2xl text-text">
        {kmFormatado} <span className="text-base font-normal text-text-faint">km</span>
      </strong>
    </div>
  )
}

function TituloSecao({ texto }: { texto: string }) {
  return (
    <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-text-faint">
      {texto}
    </h3>
  )
}

function ListaAlertas({ alertas }: { alertas: Alerta[] | null }) {
  if (!alertas || alertas.length === 0) {
    return <p className="text-sm text-text-faint">Nenhuma peca em uso registrada ainda.</p>
  }

  return (
    <>
      {alertas.map((a) => (
        <CardAlerta key={a.manutencao_peca_id} alerta={a} />
      ))}
    </>
  )
}

function corDaBorda(status: string) {
  if (status === 'critico') return 'border-l-critico'
  if (status === 'alerta') return 'border-l-alerta'
  return 'border-l-meta'
}

function textoAlerta(alerta: Alerta) {
  if (alerta.status === 'sem_previsao') {
    return 'Sem vida util prometida cadastrada'
  }

  if (alerta.km_restante === null) {
    return ''
  }

  if (alerta.km_restante >= 0) {
    const km = alerta.km_restante.toLocaleString('pt-BR')
    const dias = alerta.dias_restante_estimado ?? '?'
    return 'Faltam ' + km + ' km ou ' + dias + ' dias'
  }

  const kmAtraso = Math.abs(alerta.km_restante).toLocaleString('pt-BR')
  return 'Troca atrasada ha ' + kmAtraso + ' km'
}

function CardAlerta({ alerta }: { alerta: Alerta }) {
  const cor = corDaBorda(alerta.status)
  const texto = textoAlerta(alerta)

  return (
    <div className={'mb-2 rounded-lg border border-border border-l-4 ' + cor + ' bg-surface p-3'}>
      <strong className="text-sm text-text">{alerta.categoria_nome}</strong>
      <span className="text-sm text-text-dim"> - {alerta.nome_marca}</span>
      <div className="mt-1 text-xs text-text-faint">{texto}</div>
      {alerta.status !== 'sem_previsao' && (
        <div className="mt-1 text-xs font-bold text-text">{alerta.percentual_uso}%</div>
      )}
    </div>
  )
}

function CardResumoMes({
  totalManutencao,
  totalCombustivel,
}: {
  totalManutencao: number
  totalCombustivel: number
}) {
  const total = totalManutencao + totalCombustivel
  const totalFormatado = total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const combustivelFormatado = totalCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const manutencaoFormatada = totalManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <strong className="font-mono text-xl text-text">R$ {totalFormatado}</strong>
      <div className="text-xs text-text-faint">Total no mes</div>
      <div className="mt-2 text-sm text-text-dim">Combustivel: R$ {combustivelFormatado}</div>
      <div className="text-sm text-text-dim">Manutencao: R$ {manutencaoFormatada}</div>
    </div>
  )
}

function AcoesRapidas() {
  return (
    <div className="mt-5 flex gap-3">
      <Link href="/historico/nova" className="rounded-xl bg-action px-4 py-3 text-sm font-bold text-base">
        + Manutencao
      </Link>
      <Link href="/consumo/novo" className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text">
        + Abastecimento
      </Link>
    </div>
  )
}