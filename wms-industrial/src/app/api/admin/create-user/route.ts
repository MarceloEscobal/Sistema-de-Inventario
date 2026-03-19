import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, empresa_id } = body

    // 1. Verificar que el solicitante es el super-admin usando SSR client
    const cookieStore = await cookies()
    const supabaseSSR = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabaseSSR.auth.getUser()
    if (!user || user.email !== 'sistema_inv@inv.com') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // 2. Usar Admin client para crear el usuario correctamente (vía GoTrue Admin API)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { empresa_id, role }
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // 3. Crear el perfil en users_profiles
    const { error: profileError } = await supabaseAdmin
      .from('users_profiles')
      .upsert({
        id: newUser.user.id,
        role,
        empresa_id,
      })

    if (profileError) {
      // Si falla el perfil, limpiar el usuario creado
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ id: newUser.user.id, status: 'success' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
