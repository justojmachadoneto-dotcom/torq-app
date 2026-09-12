import { createClient } from '@/lib/supabase/server'
import { VeiculoAtivoHeader } from '@/components/VeiculoAtivoHeader'
import { CabecalhoPagina } from '@/components/CabecalhoPagina'

type LinhaComparativo = {
  peca_catalogo_id: string
  nome_marca: string
  vida_util_prometida_km: number | null
  vida_util_real_km: number | null
  percentual_eficiencia: number | null
  custo_por_mil_km: number | null
  motivo_troca: string
  elegivel_ranking: boolean
  pecas_catalogo?: {
    categoria_id: string
    categorias_peca?: {
      nome: string
    }
  }
}

export default async function CompararPage({
  searchParams,
}: {
  searchParams: { categoria?: string }
}) {
  const supabase = await createClient()

  const veiculos = await buscarVeiculos(supabase)
  const veiculoAtivo = veiculos?.find((v: any) => v.eh_veiculo_ativo)

  if (!veiculoAtivo) {
    return <TelaSemVeiculo />
  }

  const linhasBrutas = await buscarComparativo(supabase, veiculoAtivo.id)
  const categorias = extrairCategorias(linhasBrutas)
  const categoriaSelecionada = searchParams.categoria || categorias[0]?.[0]
  const linhas = filtrarESortear(linhasBrutas, categoriaSelecionada)
  const melhorId = encontrarMelhorId(linhas)

  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Comparativo" />

      <VeiculoAtivoHeader modelo={veiculoAtivo.modelo} placa={veiculoAtivo.placa} />

      <div className="mt-6">
        {categorias.length === 0 ? (
          <MensagemSemDados />
        ) : (
          <>
            <FiltrosCategoria categorias={categorias} selecionada={categoriaSelecionada} />
            <ListaComparativo linhas={linhas} melhorId={melhorId} />
          </>
        )}
      </div>
    </div>
  )
}

async function buscarVeiculos(supabase: any) {
  const resposta = await supabase.from('veiculos').select('*').eq('ativo', true)
  return resposta.data
}

async function buscarComparativo(supabase: any, veiculoId: string) {
  const resposta = await supabase
    .from('vw_comparativo_durabilidade')
    .select('*, pecas_catalogo(categoria_id, categorias_peca(nome))')
    .eq('veiculo_id', veiculoId)

  return (resposta.data || []) as LinhaComparativo[]
}

function extrairCategorias(linhas: LinhaComparativo[]) {
  const mapa = new Map<string, string>()

  for (const linha of linhas) {
    const catId = linha.pecas_catalogo?.categoria_id
    const catNome = linha.pecas_catalogo?.categorias_peca?.nome
    if (catId && catNome) {
      mapa.set(catId, catNome)
    }
  }

  return Array.from(mapa.entries())
}

function filtrarESortear(linhas: LinhaComparativo[], categoriaId: string | undefined) {
  const filtradas = linhas.filter((c) => c.pecas_catalogo?.categoria_id === categoriaId)

  filtradas.sort((a, b) => {
    const ea = a.percentual_eficiencia || 0
    const eb = b.percentual_eficiencia || 0
    return eb - ea
  })

  return filtradas
}

function encontrarMelhorId(linhas: LinhaComparativo[]) {
  const melhor = linhas.find((l) => l.elegivel_ranking)
  return melhor?.peca_catalogo_id
}

function TelaSemVeiculo() {
  return (
    <div className="p-6 font-sans text-text">
      <CabecalhoPagina titulo="Comparar" />
      <p className="mt-2 text-sm text-text-dim">Nenhum veiculo ativo selecionado.</p>
    </div>
  )
}

function MensagemSemDados() {
  return (
    <p className="text-sm text-text-faint">
      Ainda nao ha nenhuma peca com ciclo completo neste veiculo. O comparativo
      aparece assim que uma peca e substituida pela primeira vez.
    </p>
  )
}

function FiltrosCategoria({
  categorias,
  selecionada,
}: {
  categorias: [string, string][]
  selecionada: string | undefined
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {categorias.map(([id, nome]) => (
        <PillCategoria key={id} id={id} nome={nome} ativa={id === selecionada} />
      ))}
    </div>
  )
}

function PillCategoria({ id, nome, ativa }: { id: string; nome: string; ativa: boolean }) {
  const classeBase = 'rounded-full border px-3 py-2 text-sm font-semibold '
  const classeCor = ativa
    ? 'bg-action text-base border-action'
    : 'bg-transparent text-text border-border'
  const classeFinal = classeBase + classeCor
  const link = '/comparar?categoria=' + id

  return (
    <a href={link} className={classeFinal}>
      {nome}
    </a>
  )
}

function ListaComparativo({
  linhas,
  melhorId,
}: {
  linhas: LinhaComparativo[]
  melhorId: string | undefined
}) {
  return (
    <>
      {linhas.map((l) => (
        <CardComparativo
          key={l.peca_catalogo_id}
          linha={l}
          destaque={l.peca_catalogo_id === melhorId}
        />
      ))}
    </>
  )
}

function formatarKm(valor: number | null) {
  if (valor === null) return '-'
  return valor.toLocaleString('pt-BR') + ' km'
}

function formatarCustoPorKm(valor: number | null) {
  if (valor === null) return '-'
  const custo = (valor / 1000).toFixed(3)
  return 'R$ ' + custo
}

function textoMotivo(motivo: string) {
  if (motivo === 'quebra_defeito') return 'quebra/defeito'
  return 'acidente'
}

function CardComparativo({
  linha,
  destaque,
}: {
  linha: LinhaComparativo
  destaque: boolean
}) {
  const bordaBase = 'mb-3 rounded-xl border bg-surface p-4 '
  const bordaCor = destaque ? 'border-meta border-2 ' : 'border-border '
  const opacidade = linha.elegivel_ranking ? '' : 'opacity-60'
  const classeFinal = bordaBase + bordaCor + opacidade

  return (
    <div className={classeFinal}>
      <div className="flex items-center justify-between">
        <strong className="text-sm text-text">{linha.nome_marca}</strong>
        {destaque && (
          <span className="rounded-full bg-meta/15 px-2 py-1 text-[10px] font-bold text-meta">
            MELHOR CUSTO-BENEFICIO
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3 font-mono text-sm">
        <ItemMetrica label="Prometido" valor={formatarKm(linha.vida_util_prometida_km)} />
        <ItemMetrica label="Real" valor={formatarKm(linha.vida_util_real_km)} />
        <ItemMetrica label="Eficiencia" valor={String(linha.percentual_eficiencia ?? '-') + '%'} />
        <ItemMetrica label="Custo/km" valor={formatarCustoPorKm(linha.custo_por_mil_km)} />
      </div>

      {!linha.elegivel_ranking && (
        <div className="mt-2 text-xs text-alerta">
          Fora do ranking: motivo da troca foi {textoMotivo(linha.motivo_troca)}
        </div>
      )}
    </div>
  )
}

function ItemMetrica({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="font-sans text-[10px] uppercase text-text-faint">{label}</div>
      <div className="text-text">{valor}</div>
    </div>
  )
}