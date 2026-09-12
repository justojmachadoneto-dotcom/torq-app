import { createClient } from '@/lib/supabase/server'
import { criarManutencao } from '../actions'
import { BotaoVoltar } from '@/components/BotaoVoltar'

export default async function NovaManutencaoPage({
  searchParams,
}: {
  searchParams: { erro?: string }
}) {
  const supabase = await createClient()

  const respostaVeiculos = await supabase
    .from('veiculos')
    .select('*')
    .eq('ativo', true)

  const respostaPecas = await supabase
    .from('pecas_catalogo')
    .select('*, categorias_peca(nome)')
    .eq('ativo', true)

  const veiculos = respostaVeiculos.data || []
  const pecas = respostaPecas.data || []
  const veiculoAtivo = veiculos.find((v: any) => v.eh_veiculo_ativo)
  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 font-sans text-text">
      <BotaoVoltar titulo="Nova manutenção" subtitulo="Registro rápido" />

      <p className="mb-4 text-xs text-text-faint">
        Veiculo: {veiculoAtivo?.modelo} - {veiculoAtivo?.placa}
      </p>

      {searchParams.erro && (
        <p className="mb-4 text-sm text-critico">{searchParams.erro}</p>
      )}

      <form action={criarManutencao} className="flex flex-col gap-4">
        <input type="hidden" name="veiculo_id" value={veiculoAtivo?.id} />

        <BlocoRadio titulo="Tipo de serviço">
          <OpcaoRadio name="tipo" value="preventiva" texto="Preventiva" padrao />
          <OpcaoRadio name="tipo" value="corretiva" texto="Corretiva" />
        </BlocoRadio>

        <Campo label="Data">
          <input
            name="data"
            type="date"
            required
            defaultValue={hoje}
            className="campo-input w-full"
          />
        </Campo>

        <Campo label="Odometro (km)">
          <input
            name="km_registro"
            type="number"
            required
            className="campo-input w-full font-mono"
          />
        </Campo>

        <Campo label="Oficina">
          <input name="oficina" className="campo-input w-full" />
        </Campo>

        <Campo label="Mão de obra (R$)">
          <input
            name="valor_mao_obra"
            type="number"
            step="0.01"
            className="campo-input w-full font-mono"
          />
        </Campo>

        <hr className="border-border" />
        <p className="text-xs text-text-faint">Peça aplicada (opcional)</p>

        <Campo label="Peça do catálogo">
          <select name="peca_catalogo_id" className="campo-input w-full">
            <option value="">Nenhuma</option>
            {pecas.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.categorias_peca?.nome} - {p.nome_marca}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Valor pago pela peça (R$)">
          <input
            name="valor_pago"
            type="number"
            step="0.01"
            className="campo-input w-full font-mono"
          />
        </Campo>

        <Campo label="Local de compra">
          <input name="local_compra" className="campo-input w-full" />
        </Campo>

        <BlocoRadio titulo="Motivo da troca">
          <OpcaoRadio name="motivo_troca" value="desgaste_normal" texto="Desgaste normal" padrao />
          <OpcaoRadio name="motivo_troca" value="quebra_defeito" texto="Quebra/defeito" />
          <OpcaoRadio name="motivo_troca" value="acidente" texto="Acidente" />
        </BlocoRadio>

        <Campo label="Observações">
          <textarea name="observacoes" className="campo-input w-full" rows={3} />
        </Campo>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-action py-4 text-sm font-bold text-base"
        >
          SALVAR MANUTENÇÃO
        </button>
      </form>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label className="text-[11px] font-bold uppercase tracking-wide text-text-dim">
        {label}
      </label>
      {children}
    </div>
  )
}

function BlocoRadio({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-text-dim">
        {titulo}
      </p>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  )
}

function OpcaoRadio({
  name,
  value,
  texto,
  padrao,
}: {
  name: string
  value: string
  texto: string
  padrao?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text">
      <input type="radio" name={name} value={value} defaultChecked={padrao} />
      {texto}
    </label>
  )
}