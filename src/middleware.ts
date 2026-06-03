import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Redirect unauthenticated users to Login
    if (!user && request.nextUrl.pathname !== '/' && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
        // Allow public assets
        if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/static') || request.nextUrl.pathname.includes('.')) {
            return response
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. SEG-09: RBAC de borda usando user_metadata (sem round-trip ao banco)
    // Durante o registro de aluno, armazenamos role: 'ALUNO' em user_metadata.
    // Isso permite bloquear alunas de rotas /admin/* no edge, antes mesmo do layout.
    // Para PROFESSOR/ADMIN, a verificação completa permanece nos layouts (Server Components).
    if (user) {
        const userMetadataRole = user.user_metadata?.role as string | undefined
        const pathname = request.nextUrl.pathname

        // Bloquear ALUNOs de acessar qualquer rota /admin/*
        if (userMetadataRole === 'ALUNO' && pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/aluno', request.url))
        }

        // Bloquear ALUNOs de acessar /api/backup
        if (userMetadataRole === 'ALUNO' && pathname.startsWith('/api/backup')) {
            return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
