type VeiculoAtivoHeaderProps = {
  modelo: string
  placa: string
}

export function VeiculoAtivoHeader({ modelo, placa }: VeiculoAtivoHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
      <div>
        <div className="text-sm font-semibold text-text">{modelo}</div>
        <div className="font-mono text-xs text-text-faint">{placa}</div>
      </div>
      <span className="rounded-full border border-action/40 px-2 py-1 text-[10px] font-bold text-action">
        ATIVO
      </span>
    </div>
  )
}