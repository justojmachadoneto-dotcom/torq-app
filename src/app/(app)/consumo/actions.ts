'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function criarAbastecimento(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const litros = Number(formData.get('litros'))
  const precoLitro = Number(formData.get('preco_litro'))

  const { error } = await supabase.from('abastecimentos').insert({
    veiculo_id: formData.get('veiculo_id') as string,
    data: formData.get('data') as string,
    tipo_combustivel: formData.get('tipo_combustivel') as string,
    preco_litro: precoLitro,
    litros: litros,
    valor_total: Number((litros * precoLitro).toFixed(2)),
    km_registro: Number(formData.get('km_registro')),
    posto: formData.get('posto') as string,
  })

  if (error) {
    redirect('/consumo/novo?erro=' + encodeURIComponent(error.message))
  }

  revalidatePath('/consumo')
  redirect('/consumo')
}