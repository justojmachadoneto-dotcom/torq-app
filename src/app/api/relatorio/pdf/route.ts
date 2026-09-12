import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RelatorioPDF } from '@/lib/pdf/RelatorioPDF'

export async function GET() {
  const supabase = await createClient()

  const respostaVeiculos = await supabase
    .from('veiculos')
    .select('*')
    .eq('ativo', true)

  const veiculos = respostaVeiculos.data || []
  const veiculoAtivo = veiculos.find((v: any) => v.eh_veiculo_ativo)

  if (!veiculoAtivo) {
    return NextResponse.json({ erro: 'Nenhum veiculo ativo' }, { status: 400 })
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

  const totalMaoObra = manutencoes.reduce((s: number, m: any) => s + (m.valor_mao_obra || 0), 0)

  const totalPecas = manutencoes.reduce((soma: number, m: any) => {
    const pecas = m.manutencao_pecas || []
    const totalDaManutencao = pecas.reduce(
      (s: number, p: any) => s + (p.valor_pago || 0),
      0
    )
    return soma + totalDaManutencao
  }, 0)

  const totalCombustivel = abastecimentos.reduce(
    (s: number, a: any) => s + (a.valor_total || 0),
    0
  )

  const litrosTotais = abastecimentos.reduce(
    (s: number, a: any) => s + (a.litros || 0),
    0
  )

  const preventivas = manutencoes.filter((m: any) => m.tipo === 'preventiva').length
  const corretivas = manutencoes.filter((m: any) => m.tipo === 'corretiva').length

  const ordenadas = [...manutencoes].sort((a: any, b: any) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })
  const ultima = ordenadas[0]

  const ultimaManutencaoTexto = ultima
    ? new Date(ultima.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : '-'

  const buffer = await renderToBuffer(
    RelatorioPDF({
      dados: {
        modelo: veiculoAtivo.modelo,
        ano: veiculoAtivo.ano,
        placa: veiculoAtivo.placa,
        kmAtual: veiculoAtivo.km_atual,
        dataGeracao: new Date().toLocaleDateString('pt-BR'),
        preventivas,
        corretivas,
        ultimaManutencao: ultimaManutencaoTexto,
        litrosTotais,
        totalCombustivel,
        totalManutencao: totalPecas + totalMaoObra,
        totalGeral: totalPecas + totalMaoObra + totalCombustivel,
      },
    })
  )

  const nomeArquivo = 'relatorio-' + veiculoAtivo.placa + '.pdf'

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + nomeArquivo + '"',
    },
  })
}