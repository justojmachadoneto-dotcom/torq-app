import { criarVeiculo } from '../actions'
import { BotaoVoltar } from '@/components/BotaoVoltar'

export default function NovoVeiculoPage({
  searchParams,
}: {
  searchParams: { erro?: string }
}) {
  return (
    <div className="p-6 font-sans text-text">
      <BotaoVoltar titulo="Novo veiculo" subtitulo="Cadastro" />

      {searchParams.erro && (
        <p className="mb-4 text-sm text-critico">{searchParams.erro}</p>
      )}

      <form action={criarVeiculo} className="flex flex-col gap-4">
        <Campo label="Modelo / Apelido">
          <input name="modelo" required className="campo-input w-full" />
        </Campo>

        <div className="flex gap-3">
          <Campo label="Placa">
            <input name="placa" required className="campo-input w-full" />
          </Campo>
          <Campo label="Ano">
            <input name="ano" type="number" className="campo-input w-full font-mono" />
          </Campo>
        </div>

        <Campo label="Quilometragem atual">
          <input name="km_atual" type="number" required className="campo-input w-full font-mono" />
        </Campo>

        <Campo label="Combustivel principal">
          <select name="combustivel_principal" className="campo-input w-full">
            <option value="gasolina">Gasolina</option>
            <option value="etanol">Etanol</option>
            <option value="diesel">Diesel</option>
          </select>
        </Campo>

        <p className="text-xs leading-relaxed text-text-faint">
          Este veiculo sera marcado como ativo assim que salvo, caso seja o
          primeiro da sua conta. Voce pode alternar entre veiculos a qualquer
          momento em Meus veiculos.
        </p>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-action py-4 text-sm font-bold text-base"
        >
          SALVAR VEICULO
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