import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RelatorioPDF } from '@/lib/pdf/RelatorioPDF'

export async function GET() {
  const supabase = await createClient()

  const { data: veiculos } = await supabase
    .from('veiculos')
    .select('*')
    .eq('ativo', true)

  const veiculoAtivo = veiculos?.find((v) => v.eh_veiculo_ativo)

  if (!veiculoAtivo) {
    return NextResponse.json({ erro: 'Nenhum veículo ativo' }, { status: 400 })
  }

  const { data: manutencoes } = await supabase
    .from('manutencoes')
    .select('id, tipo, data, valor_mao_obra, manutencao_pecas(valor_pago)')
    .eq('veiculo_id', veiculoAtivo.id)

  const { data: abastecimentos } = await supabase
    .from('abastecimentos')
    .select('valor_total, litros')
    .eq('veiculo_id', veiculoAtivo.id)

  const totalMaoObra = (manutencoes || []).reduce((s, m) => s + (m.valor_mao_obra || 0), 0)
  const totalPecas = (manutencoes || []).reduce((soma, m) => {
    const pecas = m.manutencao_pecas || []
    return soma + pecas.reduce((s, p) => s + (p.valor_pago || 0), 0)
  }, 0)
  const totalCombustivel = (abastecimentos || []).reduce((s, a) => s + (a.valor_total || 0), 0)
  const litrosTotais = (abastecimentos || []).reduce((s, a) => s + (a.litros || 0), 0)

  const preventivas = (manutencoes || []).filter((m) => m.tipo === 'preventiva').length
  const corretivas = (manutencoes || []).filter((m) => m.tipo === 'corretiva').length

  const ultima = [...(manutencoes || [])].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )[0]

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
        ultimaManutencao: ultima
          ? new Date(ultima.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          : '—',
        litrosTotais,
        totalCombustivel,
        totalManutencao: totalPecas + totalMaoObra,
        totalGeral: totalPecas + totalMaoObra + totalCombustivel,
      },
    })
  )

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="relatorio-${veiculoAtivo.placa}.pdf"`,
    },
  })
}