import { createClient } from '@/lib/supabase/server'
import { criarCategoria, criarPeca } from '../actions'
import { BotaoVoltar } from '@/components/BotaoVoltar'

export default async function NovaPecaPage({
  searchParams,
}: {
  searchParams: { erro?: string; sucesso?: string }
}) {
  const supabase = await createClient()
  const resposta = await supabase
    .from('categorias_peca')
    .select('*')
    .eq('ativo', true)
    .order('nome')

  const categorias = resposta.data || []

  return (
    <div className="p-6 font-sans text-text">
      <BotaoVoltar titulo="Nova peca" subtitulo="Catalogo" />

      {searchParams.erro && (
        <p className="mb-4 text-sm text-critico">{searchParams.erro}</p>
      )}
      {searchParams.sucesso && (
        <p className="mb-4 text-sm text-meta">Peca cadastrada!</p>
      )}

      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold text-text">Criar nova categoria</h3>
        <form action={criarCategoria} className="flex gap-2">
          <input
            name="nome_categoria"
            placeholder="Ex: Pastilha de freio dianteira"
            required
            className="campo-input w-full"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-xl bg-action px-4 text-sm font-bold text-base"
          >
            Adicionar
          </button>
        </form>
      </div>

      <form action={criarPeca} className="flex flex-col gap-4">
        <Campo label="Categoria">
          <select name="categoria_id" required className="campo-input w-full">
            <option value="">Selecione...</option>
            {categorias.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Nome / Marca da peca">
          <input
            name="nome_marca"
            required
            placeholder="Ex: Brembo P28035"
            className="campo-input w-full"
          />
        </Campo>

        <div className="flex gap-3">
          <Campo label="Codigo">
            <input name="codigo" className="campo-input w-full" />
          </Campo>
          <Campo label="Valor de referencia">
            <input
              name="valor_referencia"
              type="number"
              step="0.01"
              className="campo-input w-full font-mono"
            />
          </Campo>
        </div>

        <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-text-faint">
          Vida util prometida (fabricante)
        </p>

        <div className="flex gap-3">
          <Campo label="Quilometragem">
            <input
              name="vida_util_prometida_km"
              type="number"
              className="campo-input w-full font-mono"
            />
          </Campo>
          <Campo label="Tempo (dias, opcional)">
            <input
              name="vida_util_prometida_dias"
              type="number"
              className="campo-input w-full font-mono"
            />
          </Campo>
        </div>

        <p className="text-xs leading-relaxed text-text-faint">
          Sem esse dado, o app nao conseguira prever a proxima troca nem
          comparar esta peca com outras marcas, mas voce pode preencher
          depois.
        </p>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-action py-4 text-sm font-bold text-base"
        >
          SALVAR NO CATALOGO
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