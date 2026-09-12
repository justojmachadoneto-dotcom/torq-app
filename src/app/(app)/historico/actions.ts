'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function criarManutencao(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const veiculoId = formData.get('veiculo_id') as string

  // 1) cria a manutenção
  const { data: manutencao, error: erroManutencao } = await supabase
    .from('manutencoes')
    .insert({
      veiculo_id: veiculoId,
      tipo: formData.get('tipo') as string,
      data: formData.get('data') as string,
      km_registro: Number(formData.get('km_registro')),
      oficina: formData.get('oficina') as string,
      valor_mao_obra: formData.get('valor_mao_obra')
        ? Number(formData.get('valor_mao_obra'))
        : 0,
      observacoes: formData.get('observacoes') as string,
    })
    .select()
    .single()

  if (erroManutencao) {
    redirect('/historico/nova?erro=' + encodeURIComponent(erroManutencao.message))
  }

  // 2) se uma peça foi selecionada, registra em manutencao_pecas
  const pecaCatalogoId = formData.get('peca_catalogo_id') as string
  if (pecaCatalogoId) {
    const { error: erroPeca } = await supabase.from('manutencao_pecas').insert({
      manutencao_id: manutencao.id,
      peca_catalogo_id: pecaCatalogoId,
      valor_pago: formData.get('valor_pago') ? Number(formData.get('valor_pago')) : null,
      local_compra: formData.get('local_compra') as string,
      motivo_troca: formData.get('motivo_troca') as string || 'desgaste_normal',
    })

    if (erroPeca) {
      redirect('/historico/nova?erro=' + encodeURIComponent(erroPeca.message))
    }
  }

  revalidatePath('/historico')
  redirect('/historico')
}