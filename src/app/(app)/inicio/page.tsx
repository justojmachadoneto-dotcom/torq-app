import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { sair } from '../actions'

type Veiculo = {
  id: string
  modelo: string
  placa: string
  km_atual: number
  eh_veiculo_ativo: boolean
}

export default async function InicioPage() {
  const supabase = await createClient()

  const respostaVeiculos = await supabase.from('veiculos').select('*').eq('ativo', true)
  const veiculos = (respostaVeiculos.data || []) as Veiculo[]
  const veiculoAtivo = veiculos.find((v) => v.eh_veiculo_ativo)

  const dados = veiculoAtivo
    ? await buscarDadosResumo(supabase, veiculoAtivo.id)
    : null

  return (
    <div className="font-sans text-text">
      <Cabecalho />

      <div className="p-6 pt-4">
        {dados && <CardProximaManutencao dados={dados} />}
        {dados && <LinhaEstatisticas dados={dados} />}

        <GradeMenu />

        <form action={sair} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-text-dim"
          >
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  )
}

async function buscarDadosResumo(supabase: any, veiculoId: string) {
  const respostaAlertas = await supabase
    .from('vw_previsao_trocas')
    .select('*')
    .eq('veiculo_id', veiculoId)
    .order('percentual_uso', { ascending: false })
    .limit(1)

  const inicioMes = new Date()
  inicioMes.setDate(1)
  const inicioMesStr = inicioMes.toISOString().split('T')[0]

  const respostaManutencoesMes = await supabase
    .from('manutencoes')
    .select('id, valor_mao_obra, manutencao_pecas(valor_pago)')
    .eq('veiculo_id', veiculoId)
    .gte('data', inicioMesStr)

  const respostaAbastecimentos = await supabase
    .from('abastecimentos')
    .select('valor_total, litros, km_registro, data')
    .eq('veiculo_id', veiculoId)
    .order('data', { ascending: false })

  const manutencoesMes = respostaManutencoesMes.data || []
  const abastecimentos = respostaAbastecimentos.data || []
  const alerta = (respostaAlertas.data || [])[0] || null

  let totalMaoObra = 0
  for (const m of manutencoesMes) {
    totalMaoObra = totalMaoObra + (m.valor_mao_obra || 0)
    const pecas = m.manutencao_pecas || []
    for (const p of pecas) {
      totalMaoObra = totalMaoObra + (p.valor_pago || 0)
    }
  }

  let totalCombustivelMes = 0
  for (const a of abastecimentos) {
    if (a.data >= inicioMesStr) {
      totalCombustivelMes = totalCombustivelMes + (a.valor_total || 0)
    }
  }

  const mediaKmL = calcularMediaKmL(abastecimentos)

  return {
    alerta,
    manutencoesNoMes: manutencoesMes.length,
    totalGastoMes: totalMaoObra + totalCombustivelMes,
    mediaKmL,
  }
}

function calcularMediaKmL(abastecimentos: any[]) {
  if (abastecimentos.length < 2) return null

  const ordenados = [...abastecimentos].sort((a, b) => a.km_registro - b.km_registro)
  const primeiro = ordenados[0]
  const ultimo = ordenados[ordenados.length - 1]
  const kmPercorridos = ultimo.km_registro - primeiro.km_registro

  let litrosTotais = 0
  for (let i = 1; i < ordenados.length; i++) {
    litrosTotais = litrosTotais + ordenados[i].litros
  }

  if (litrosTotais === 0 || kmPercorridos <= 0) return null

  return kmPercorridos / litrosTotais
}

function Cabecalho() {
  return (
    <div className="relative h-44 w-full overflow-hidden">
      <Image
        src="/images/fundo-garagem.jpg"
        alt="Garagem"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-base/30" />

      <div className="relative flex h-full flex-col gap-3 p-5">
        <Image
          src="/images/torq-logo.png"
          alt="TORQ"
          width={130}
          height={44}
          priority
        />

        <div>
          <h1 className="text-2xl font-bold text-text">Ola, Justo!</h1>
          <p className="mt-1 text-xs text-text-dim">
            Seu veiculo sempre em dia, mais seguranca na estrada.
          </p>
        </div>
      </div>
    </div>
  )
}

type DadosResumo = {
  alerta: any
  manutencoesNoMes: number
  totalGastoMes: number
  mediaKmL: number | null
}

function CardProximaManutencao({ dados }: { dados: DadosResumo }) {
  if (!dados.alerta) {
    return null
  }

  const km = dados.alerta.km_restante
  const dias = dados.alerta.dias_restante_estimado

  return (
    <Link
      href="/dashboard"
      className="mb-4 flex items-center gap-4 rounded-xl border-l-4 border-l-action border border-border bg-surface p-4"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-action/40 text-action">
        <IconeChave />
      </div>
      <div className="flex-1">
        <div className="text-xs text-text-faint">Proxima manutencao</div>
        <div className="font-mono text-xl font-bold text-text">
          {km !== null ? km.toLocaleString('pt-BR') + ' km' : '—'}
        </div>
        <div className="text-xs text-text-faint">
          {dias !== null ? 'ou em ' + dias + ' dias' : ''}
        </div>
      </div>
      <IconeSeta />
    </Link>
  )
}

function LinhaEstatisticas({ dados }: { dados: DadosResumo }) {
  const mediaTexto = dados.mediaKmL === null ? '—' : dados.mediaKmL.toFixed(1)
  const gastoTexto = dados.totalGastoMes.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  })

  return (
    <div className="mb-6 grid grid-cols-3 gap-2">
      <MiniEstatistica titulo="Manutencoes no mes" valor={String(dados.manutencoesNoMes)} />
      <MiniEstatistica titulo="Consumo medio (km/l)" valor={mediaTexto} />
      <MiniEstatistica titulo="Total gasto no mes" valor={'R$ ' + gastoTexto} />
    </div>
  )
}

function MiniEstatistica({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="text-[10px] leading-tight text-text-faint">{titulo}</div>
      <div className="mt-1 font-mono text-lg font-bold text-text">{valor}</div>
    </div>
  )
}

function GradeMenu() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ItemMenu href="/dashboard" titulo="Dashboard" subtitulo="Visao geral do seu veiculo" icone="dashboard" />
      <ItemMenu href="/historico" titulo="Historico" subtitulo="Manutencoes e servicos" icone="historico" />
      <ItemMenu href="/comparar" titulo="Comparar" subtitulo="Durabilidade entre marcas" icone="comparar" />
      <ItemMenu href="/consumo" titulo="Consumos" subtitulo="Combustivel e rendimento" icone="consumo" />
      <ItemMenu href="/veiculos" titulo="Veiculos" subtitulo="Seus veiculos cadastrados" icone="veiculos" />
      <ItemMenu href="/pecas" titulo="Pecas" subtitulo="Controle de pecas e trocas" icone="pecas" />
      <div className="col-span-2">
        <ItemMenu href="/relatorio" titulo="Relatorio" subtitulo="Custos, manutencoes e mais" icone="relatorio" />
      </div>
    </div>
  )
}

function ItemMenu({
  href,
  titulo,
  subtitulo,
  icone,
}: {
  href: string
  titulo: string
  subtitulo: string
  icone: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <IconeMenu nome={icone} />
      <div>
        <div className="text-sm font-bold text-text">{titulo}</div>
        <div className="mt-1 text-xs text-text-faint">{subtitulo}</div>
      </div>
    </Link>
  )
}

function IconeMenu({ nome }: { nome: string }) {
  const caminho = '/images/icones/' + nome + '.png'

  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
      <Image src={caminho} alt="" width={36} height={36} />
    </div>
  )
}

function IconeChave() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M14.7 6.3a4 4 0 1 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconeSeta() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}