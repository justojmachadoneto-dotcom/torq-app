'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function criarCategoria(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nome = formData.get('nome_categoria') as string

  const { error } = await supabase.from('categorias_peca').insert({
    usuario_id: user.id,
    nome,
  })

  if (error) {
    redirect('/pecas/novo?erro=' + encodeURIComponent(error.message))
  }

  revalidatePath('/pecas/novo')
}

export async function criarPeca(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('pecas_catalogo').insert({
    usuario_id: user.id,
    categoria_id: formData.get('categoria_id') as string,
    nome_marca: formData.get('nome_marca') as string,
    codigo: formData.get('codigo') as string,
    valor_referencia: formData.get('valor_referencia')
      ? Number(formData.get('valor_referencia'))
      : null,
    vida_util_prometida_km: formData.get('vida_util_prometida_km')
      ? Number(formData.get('vida_util_prometida_km'))
      : null,
    vida_util_prometida_dias: formData.get('vida_util_prometida_dias')
      ? Number(formData.get('vida_util_prometida_dias'))
      : null,
  })

  if (error) {
    redirect('/pecas/novo?erro=' + encodeURIComponent(error.message))
  }

  revalidatePath('/pecas/novo')
  redirect('/pecas/novo?sucesso=1')
}