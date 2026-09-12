import Image from 'next/image'
import { login, signup } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { erro?: string; cadastro?: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base p-6 font-sans text-text">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/images/torq-logo.png" alt="TORQ" width={160} height={54} priority />
        </div>

        {searchParams.erro && (
          <p className="mb-4 text-center text-sm text-critico">{searchParams.erro}</p>
        )}
        {searchParams.cadastro === 'sucesso' && (
          <p className="mb-4 text-center text-sm text-meta">
            Cadastro feito! Verifique seu email para confirmar a conta.
          </p>
        )}

        <form className="flex flex-col gap-4">
          <Campo label="Email">
            <input id="email" name="email" type="email" required className="campo-input w-full" />
          </Campo>

          <Campo label="Senha">
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="campo-input w-full"
            />
          </Campo>

          <button
            formAction={login}
            className="mt-2 rounded-xl bg-action py-4 text-sm font-bold text-base"
          >
            ENTRAR
          </button>

          <button
            formAction={signup}
            className="rounded-xl border border-border py-4 text-sm font-semibold text-text"
          >
            CRIAR CONTA
          </button>
        </form>
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold uppercase tracking-wide text-text-dim">
        {label}
      </label>
      {children}
    </div>
  )
}