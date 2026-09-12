import { createClient } from '@/lib/supabase/server'
import { criarAbastecimento } from '../actions'
import { BotaoVoltar } from '@/components/BotaoVoltar'

export default async function NovoAbastecimentoPage({
  searchParams,
}: {
  searchParams: { erro?: string }
}) {
  const supabase = await createClient()
  const resposta = await supabase.from('veiculos').select('*').eq('ativo', true)
  const veiculos = resposta.data || []
  const veiculoAtivo = veiculos.find((v: any) => v.eh_veiculo_ativo)
  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 font-sans text-text">
      <BotaoVoltar titulo="Novo abastecimento" subtitulo="Registro rapido" />

      <p className="mb-4 text-xs text-text-faint">
        Veiculo: {veiculoAtivo?.modelo} - {veiculoAtivo?.placa}
      </p>

      {searchParams.erro && (
        <p className="mb-4 text-sm text-critico">{searchParams.erro}</p>
      )}

      <form action={criarAbastecimento} className="flex flex-col gap-4">
        <input type="hidden" name="veiculo_id" value={veiculoAtivo?.id} />

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-text-dim">
            Combustivel
          </label>
          <div className="flex gap-4">
            <OpcaoRadio name="tipo_combustivel" value="gasolina" texto="Gasolina" padrao />
            <OpcaoRadio name="tipo_combustivel" value="etanol" texto="Etanol" />
            <OpcaoRadio name="tipo_combustivel" value="diesel" texto="Diesel" />
          </div>
        </div>

        <Campo label="Data">
          <input
            name="data"
            type="date"
            required
            defaultValue={hoje}
            className="campo-input w-full"
          />
        </Campo>

        <Campo label="Preco por litro (R$)">
          <input
            name="preco_litro"
            type="number"
            step="0.01"
            required
            className="campo-input w-full font-mono"
          />
        </Campo>

        <Campo label="Litros">
          <input
            name="litros"
            type="number"
            step="0.01"
            required
            className="campo-input w-full font-mono"
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

        <Campo label="Posto">
          <input name="posto" className="campo-input w-full" />
        </Campo>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-action py-4 text-sm font-bold text-base"
        >
          SALVAR ABASTECIMENTO
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