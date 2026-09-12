import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const estilos = StyleSheet.create({
  pagina: { padding: 32, fontSize: 11, fontFamily: 'Helvetica' },
  titulo: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitulo: { fontSize: 9, color: '#64748b', marginBottom: 20, textTransform: 'uppercase' },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: { color: '#64748b' },
  valor: { fontWeight: 700 },
  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#0f172a',
  },
  totalTexto: { fontWeight: 700, fontSize: 13 },
  rodape: { marginTop: 24, fontSize: 9, color: '#64748b' },
})

type DadosRelatorio = {
  modelo: string
  ano: number | null
  placa: string
  kmAtual: number
  dataGeracao: string
  preventivas: number
  corretivas: number
  ultimaManutencao: string
  litrosTotais: number
  totalCombustivel: number
  totalManutencao: number
  totalGeral: number
}

export function RelatorioPDF({ dados }: { dados: DadosRelatorio }) {
  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.titulo}>
          {dados.modelo} {dados.ano ? `· ${dados.ano}` : ''}
        </Text>
        <Text style={estilos.subtitulo}>
          {dados.placa} · {dados.kmAtual.toLocaleString('pt-BR')} km · gerado em {dados.dataGeracao}
        </Text>

        <LinhaPDF label="Manutenções preventivas" valor={`${dados.preventivas} registradas`} />
        <LinhaPDF label="Manutenções corretivas" valor={`${dados.corretivas} registradas`} />
        <LinhaPDF label="Última manutenção" valor={dados.ultimaManutencao} />
        <LinhaPDF label="Total de litros abastecidos" valor={`${dados.litrosTotais.toLocaleString('pt-BR')} L`} />
        <LinhaPDF label="Total investido em combustível" valor={formatarReais(dados.totalCombustivel)} />
        <LinhaPDF label="Total investido em manutenção" valor={formatarReais(dados.totalManutencao)} />

        <View style={estilos.totalLinha}>
          <Text style={estilos.totalTexto}>Total geral registrado</Text>
          <Text style={estilos.totalTexto}>{formatarReais(dados.totalGeral)}</Text>
        </View>

        <Text style={estilos.rodape}>Relatório gerado automaticamente pelo TORQ.</Text>
      </Page>
    </Document>
  )
}

function LinhaPDF({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.label}>{label}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  )
}

function formatarReais(valor: number) {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}