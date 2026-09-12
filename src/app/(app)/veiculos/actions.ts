'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function criarVeiculo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Se for o primeiro veículo do usuário, já nasce como "ativo"
  const { count } = await supabase
    .from('veiculos')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', user.id)
    .eq('ativo', true)

  const ehPrimeiro = !count

  const { error } = await supabase.from('veiculos').insert({
    usuario_id: user.id,
    modelo: formData.get('modelo') as string,
    placa: formData.get('placa') as string,
    ano: formData.get('ano') ? Number(formData.get('ano')) : null,
    km_atual: Number(formData.get('km_atual') || 0),
    combustivel_principal: formData.get('combustivel_principal') as string,
    eh_veiculo_ativo: ehPrimeiro,
  })

  if (error) {
    redirect('/veiculos/novo?erro=' + encodeURIComponent(error.message))
  }

  revalidatePath('/veiculos')
  redirect('/veiculos')
}

export async function selecionarVeiculoAtivo(veiculoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Desmarca todos e marca só o escolhido (respeita o índice único que criamos no schema)
  await supabase.from('veiculos').update({ eh_veiculo_ativo: false }).eq('usuario_id', user.id)
  await supabase.from('veiculos').update({ eh_veiculo_ativo: true }).eq('id', veiculoId)

  revalidatePath('/veiculos')
  revalidatePath('/dashboard')
}