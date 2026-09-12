import { createClient } from '@/lib/supabase/server'
import { CabecalhoPagina } from '@/components/CabecalhoPagina'

export default async function RelatorioPage() {
  const supabase = await createClient()

  const respostaVeiculos = await supabase
    .from('veiculos')
    .select('*')
    .eq('ativo', true)

  const veiculos = respostaVeiculos.data || []
  const veiculoAtivo = veiculos.find((v: any) => v.eh_veiculo_ativo)

  if (!veiculoAtivo) {
    return (
      <div className="p-6 font-sans text-text">
        <CabecalhoPagina titulo="Relatorio" />
        <p className="mt-2 text-sm text-text-dim">Nenhum veiculo ativo selecionado.</p>
      </div>
    )
  }

  const respostaManutencoes = await supabase
    .from('manutencoes')
    .select('id, tipo, data, valor_mao_obra, manutencao_pecas(valor_pago)')
    .eq('veiculo_id', veiculoAtivo.id)

  const respostaAbastecimentos = await supabase
    .from('abastecimentos')
    .select('valor_total, litros')
    .eq('veiculo_id', veiculoAtivo.id)

  const manutencoes = respostaManutencoes.data || []
  const abastecimentos = respostaAbastecimentos.data || []

  const totalPecas = somaValorPecas(manutencoes)
  const totalMaoObra = somaMaoObra(manutencoes)
  const totalCombustivel = somaCombustivel(abastecimentos)
  const totalGeral = totalPecas + totalMaoObra + totalCombustivel

  const preventivas = manutencoes.filter((m: any) => m.tipo === 'preventiva').length
  const corretivas = manutencoes.filter((m: any) => m.tipo === 'corretiva').length

  const ordenadas = [...manutencoes].sort((a: any, b: any) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })
  const ultimaManutencao = ordenadas[0]

  const litrosTotais = abastecimentos.reduce((s: number, a: any) => s + (a.litros || 0), 0)

  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Relatorio" />
      <p className="mb-4 text-xs uppercase tracking-wide text-text-faint">Resumo executivo</p>

      <div className="max-w-lg rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-1 text-lg font-bold text-text">
          {veiculoAtivo.modelo} {veiculoAtivo.ano ? '- ' + veiculoAtivo.ano : ''}
        </h2>
        <p className="mb-4 font-mono text-[11px] uppercase text-text-faint">
          {veiculoAtivo.placa} - {veiculoAtivo.km_atual.toLocaleString('pt-BR')} km - gerado em{' '}
          {new Date().toLocaleDateString('pt-BR')}
        </p>

        <LinhaRelatorio label="Manutencoes preventivas" valor={preventivas + ' registradas'} />
        <LinhaRelatorio label="Manutencoes corretivas" valor={corretivas + ' registradas'} />
        <LinhaRelatorio
          label="Ultima manutencao"
          valor={
            ultimaManutencao
              ? new Date(ultimaManutencao.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
              : '-'
          }
        />
        <LinhaRelatorio
          label="Total de litros abastecidos"
          valor={litrosTotais.toLocaleString('pt-BR') + ' L'}
        />
        <LinhaRelatorio
          label="Total investido em combustivel"
          valor={formatarReais(totalCombustivel)}
        />
        <LinhaRelatorio
          label="Total investido em manutencao"
          valor={formatarReais(totalPecas + totalMaoObra)}
        />

        <div className="mt-2 flex justify-between border-t-2 border-text pt-3 font-bold">
          <span>Total geral registrado</span>
          <span>{formatarReais(totalGeral)}</span>
        </div>
      </div>

      <div className="mt-5">
        <form action="/api/relatorio/pdf" method="GET">
          <button
            type="submit"
            className="rounded-xl bg-action px-4 py-3 text-sm font-bold text-base"
          >
            Exportar PDF
          </button>
        </form>
      </div>
    </div>
  )
}

function classeLinha() {
  const parte1 = 'flex justify-between '
  const parte2 = 'border-b border-border/50 '
  const parte3 = 'py-2 text-sm'
  return parte1 + parte2 + parte3
}

function LinhaRelatorio({ label, valor }: { label: string; valor: string }) {
  return (
    <div className={classeLinha()}>
      <span className="text-text-faint">{label}</span>
      <strong className="text-text">{valor}</strong>
    </div>
  )
}

function formatarReais(valor: number) {
  const formatado = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return 'R$ ' + formatado
}

type ManutencaoComPecas = {
  valor_mao_obra: number | null
  manutencao_pecas: { valor_pago: number | null }[] | null
}

function somaMaoObra(manutencoes: ManutencaoComPecas[]) {
  return manutencoes.reduce((s, m) => s + (m.valor_mao_obra || 0), 0)
}

function somaValorPecas(manutencoes: ManutencaoComPecas[]) {
  return manutencoes.reduce((soma, m) => {
    const pecas = m.manutencao_pecas || []
    const totalPecas = pecas.reduce((s, p) => s + (p.valor_pago || 0), 0)
    return soma + totalPecas
  }, 0)
}

function somaCombustivel(abastecimentos: { valor_total: number }[]) {
  return abastecimentos.reduce((s, a) => s + (a.valor_total || 0), 0)
}